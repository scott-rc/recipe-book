import { load } from "cheerio";
import { connections, logger } from "gadget-server";
import { convert } from "html-to-text";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export async function importRecipe(url: string) {
  logger.info({ url }, "importing recipe");

  const response = await fetch(url);
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
    model: "gpt-5",
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

  const images = $("img")
    .toArray()
    .filter((el) => $(el).attr("src")?.startsWith("https://"))
    .map((el) => ({
      src: $(el).attr("src") ?? "",
      alt: $(el).attr("alt") ?? "",
      width: $(el).attr("width") ? parseInt($(el).attr("width") ?? "0") : undefined,
      height: $(el).attr("height") ? parseInt($(el).attr("height") ?? "0") : undefined,
    }))
    .sort((a, b) => (b.width ?? 0) + (b.height ?? 0) - ((a.width ?? 0) + (a.height ?? 0)));

  // remove images that fail to be fetched
  await Promise.allSettled(images.map((image) => fetch(image.src).catch(() => images.splice(images.indexOf(image), 1))));

  return { ...saveRecipeParameters, images };
}

// const imageSchema = z.object({
//   src: z.string().describe("The source of the image."),
//   alt: z.string().nullish().describe("The alt text of the image."),
//   width: z.number().nullish().describe("The width of the image in pixels."),
//   height: z.number().nullish().describe("The height of the image in pixels."),
// });

const saveRecipeParametersSchema = z.object({
  name: z.string().describe("The name of the recipe."),
  // primaryImage: imageSchema.describe("The primary image of the recipe."),
  // images: z.array(imageSchema).describe("Additional images of the recipe."),
  directions: z.string().describe("A list of steps to prepare the recipe in Markdown."),
  ingredients: z.string().describe("A list of ingredients required for the recipe in Markdown."),
  nutrition: z.string().nullish().describe("The nutritional information for the recipe per serving in Markdown."),
  servingSize: z.number().describe("The number of servings the recipe makes."),
  prepTime: z.number().describe("The time required to prepare the recipe in milliseconds."),
  cookTime: z.number().describe("The time required to cook the recipe in milliseconds."),
});
