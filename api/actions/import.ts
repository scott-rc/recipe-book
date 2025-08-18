import { load } from "cheerio";
import { type ActionOptions, type ImportGlobalActionContext } from "gadget-server";
import { convert } from "html-to-text";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const options: ActionOptions = {
  timeoutMS: 900000,
};

export const params = {
  source: { type: "string" },
};

const paramsSchema = z.object({
  source: z.string().url(),
});

export async function run({ params, logger, connections, session, api }: ImportGlobalActionContext): Promise<{ slug: string }> {
  const userId = session?.get("user") as string;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { source } = paramsSchema.parse(params);
  logger.info({ source, userId }, "importing recipe");

  const response = await fetch(source);
  let html = await response.text();

  const $ = load(html);
  const primaryContentId =
    $("a")
      .filter((_, el) => $(el).text().toLowerCase().includes("jump to recipe"))
      .attr("href") ??
    $("a")
      .filter((_, el) => $(el).text().toLowerCase().includes("skip to recipe"))
      .attr("href") ??
    $("a")
      .filter((_, el) => $(el).text().toLowerCase().includes("skip to content"))
      .attr("href");

  if (primaryContentId && primaryContentId.startsWith("#") && primaryContentId.length > 1) {
    logger.info({ primaryContentId }, "extracting primary content");
    html = $(primaryContentId).html()?.trim() || $(primaryContentId).nextAll().wrapAll("<div></div>").parent().html()?.trim() || html;
  }

  const normalizedText = convert(html, { selectors: [{ selector: "*", options: { ignoreHref: true } }] })
    .split(/(\r\n|\n|\r)/gm)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  const completion = await connections.openai.chat.completions.create({
    model: "o3-mini",
    max_completion_tokens: 99_999,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that extracts recipes as JSON for a database. Ensure to extract the recipe as accurately as possible.",
      },
      { role: "user", content: normalizedText },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "save_recipe",
          description: "Save the extracted recipe to the database",
          parameters: zodToJsonSchema(saveRecipeParametersSchema),
        },
      },
    ],
  });

  const fn = completion.choices[0]?.message.tool_calls?.[0]?.function;
  if (fn?.name !== "save_recipe") {
    logger.error({ completion }, "gpt didn't use save_recipe function");
    throw new Error("Failed to extract recipe");
  }

  const json: unknown = JSON.parse(fn.arguments);
  const saveRecipeParameters = saveRecipeParametersSchema.parse(json);
  const recipe = await api.recipe.create({
    ...saveRecipeParameters,
    user: { _link: userId },
    source,
  });

  return { slug: recipe.slug };
}

const saveRecipeParametersSchema = z.object({
  name: z.string().describe("The name of the recipe."),
  // directions: z.array(z.string()).describe("The steps to prepare the recipe."),
  // ingredients: z.array(z.string()).describe("The ingredients required for the recipe."),
  // nutrition: z.array(z.string()).nullish().describe("The nutritional information for the recipe per serving."),
  directions: z.string().describe("The steps to prepare the recipe in markdown."),
  ingredients: z.string().describe("The ingredients required for the recipe in markdown."),
  nutrition: z.string().nullish().describe("The nutritional information for the recipe per serving in markdown."),
  servingSize: z.number().describe("The number of servings the recipe makes."),
  prepTime: z.number().describe("The time required to prepare the recipe in milliseconds."),
  cookTime: z.number().describe("The time required to cook the recipe in milliseconds."),
});
