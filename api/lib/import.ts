import { load } from "cheerio";
import { connections, logger } from "gadget-server";
import { convert } from "html-to-text";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

interface RecipeImage {
  alt: string;
  height?: number;
  src: string;
  width?: number;
}

type SaveRecipeParameters = z.infer<typeof saveRecipeParametersSchema>;
type ImportResult = SaveRecipeParameters & { images: RecipeImage[] };

export async function importRecipe(url: string): Promise<ImportResult> {
  logger.info({ url }, "importing recipe");

  const { text, images } = await fetchRecipeContent(url);

  const completion = await connections.openai.chat.completions.create({
    max_completion_tokens: 99_999,
    messages: [
      {
        content:
          "You are a helpful assistant that extracts recipes as JSON for a database. Ensure to extract the recipe as accurately as possible.",
        role: "system",
      },
      { content: text, role: "user" },
    ],
    model: "gpt-5",
    tools: [
      {
        function: {
          name: "save_recipe",
          description: "Save the extracted recipe to the database",
          parameters: zodToJsonSchema(saveRecipeParametersSchema),
        },
        type: "function",
      },
    ],
  });

  const toolCall = completion.choices[0]?.message.tool_calls?.[0];
  if (toolCall?.type !== "function" || toolCall.function.name !== "save_recipe") {
    logger.error({ completion }, "gpt didn't use save_recipe function");
    throw new Error("Failed to extract recipe");
  }

  const json: unknown = JSON.parse(toolCall.function.arguments);
  const saveRecipeParameters = saveRecipeParametersSchema.parse(json);

  const results = await Promise.allSettled(
    images.map((image) => fetch(image.src, { method: "HEAD" }).then(() => image)),
  );

  const validImages = results.flatMap((result) => {
    if (result.status === "fulfilled") {
      return [result.value];
    }
    logger.warn({ reason: result.reason }, "failed to fetch image");
    return [];
  });

  return { ...saveRecipeParameters, images: validImages };
}

/** Try markdown-first via Cloudflare's content negotiation, fall back to HTML parsing */
async function fetchRecipeContent(url: string): Promise<{ images: RecipeImage[]; text: string }> {
  // Try fetching markdown — sites behind Cloudflare with the feature enabled will respond with text/markdown
  const mdResponse = await fetch(url, { headers: { Accept: "text/markdown, text/html;q=0.9" } });
  const contentType = mdResponse.headers.get("content-type") ?? "";

  if (contentType.includes("text/markdown")) {
    const markdown = await mdResponse.text();
    logger.info({ url, tokens: mdResponse.headers.get("x-markdown-tokens") }, "fetched markdown");

    // Extract image URLs from markdown ![alt](url) syntax
    const images = extractImagesFromMarkdown(markdown);

    return { text: markdown, images };
  }

  // Fall back to HTML parsing
  return fetchRecipeContentFromHtml(await mdResponse.text());
}

function extractImagesFromMarkdown(markdown: string): RecipeImage[] {
  const imagePattern = /!\[([^\]]*)\]\((https:\/\/[^)]+)\)/g;
  const images: RecipeImage[] = [];

  for (const match of markdown.matchAll(imagePattern)) {
    if (match[1] != null && match[2] != null) {
      images.push({ alt: match[1], src: match[2] });
    }
  }

  return images;
}

function fetchRecipeContentFromHtml(html: string): { images: RecipeImage[]; text: string } {
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

  let contentHtml = html;
  if (primaryContentId && primaryContentId.startsWith("#") && primaryContentId.length > 1) {
    logger.info({ primaryContentId }, "extracting primary content");
    contentHtml =
      $(primaryContentId).html()?.trim() || $(primaryContentId).nextAll().wrapAll("<div></div>").parent().html()?.trim() || html;
  }

  const text = convert(contentHtml, { selectors: [{ options: { ignoreHref: true }, selector: "*" }] })
    .split(/(\r\n|\n|\r)/gm)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  const images = $("img")
    .toArray()
    .filter((el) => $(el).attr("src")?.startsWith("https://"))
    .map((el) => ({
      alt: $(el).attr("alt") ?? "",
      height: $(el).attr("height") ? parseInt($(el).attr("height")!, 10) : undefined,
      src: $(el).attr("src") ?? "",
      width: $(el).attr("width") ? parseInt($(el).attr("width")!, 10) : undefined,
    }))
    .sort((a, b) => (b.width ?? 0) + (b.height ?? 0) - ((a.width ?? 0) + (a.height ?? 0)));

  return { text, images };
}

const saveRecipeParametersSchema = z.object({
  name: z.string().describe("The name of the recipe."),
  directions: z.string().describe("A list of steps to prepare the recipe in Markdown."),
  ingredients: z.string().describe("A list of ingredients required for the recipe in Markdown."),
  nutrition: z.string().nullish().describe("The nutritional information for the recipe per serving in Markdown."),
  servingSize: z.number().describe("The number of servings the recipe makes."),
  prepTime: z.number().describe("The time required to prepare the recipe in milliseconds."),
  cookTime: z.number().describe("The time required to cook the recipe in milliseconds."),
});
