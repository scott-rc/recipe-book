import { type ActionOptions, type ImportGlobalActionContext } from "gadget-server";
import { z } from "zod";
import { importRecipe } from "../lib/import";

export const options: ActionOptions = {
  timeoutMS: 900000,
};

export const params = {
  source: { type: "string" },
};

const paramsSchema = z.object({
  source: z.string().url(),
});

export async function run({ params, session, api }: ImportGlobalActionContext): Promise<{ slug: string }> {
  const userId = session?.get("user") as string;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { source } = paramsSchema.parse(params);
  const recipeParameters = await importRecipe(source);
  const recipe = await api.recipe.create({
    ...recipeParameters,
    user: { _link: userId },
    source,
    images: recipeParameters.images.map((image) => ({
      create: {
        alt: image.alt,
        file: { copyURL: image.src },
        height: image.height,
        src: image.src,
        user: { _link: userId },
        width: image.width,
      },
    })),
  });

  return { slug: recipe.slug };
}
