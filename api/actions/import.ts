import type { ActionOptions, ImportGlobalActionContext } from "gadget-server";
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
  const userId: unknown = session?.get("user");
  if (typeof userId !== "string" || userId === "") {
    throw new Error("Unauthorized");
  }

  const { source } = paramsSchema.parse(params);
  const { category: categoryName, ...recipeParameters } = await importRecipe(source);

  // Find or create category if GPT suggested one
  let categoryId: string | undefined;
  if (categoryName !== null && categoryName !== undefined && categoryName !== "") {
    const trimmed = categoryName.trim();
    if (trimmed) {
      const existing = await api.category.findMany({
        filter: { name: { equals: trimmed }, userId: { equals: userId } },
        first: 1,
        select: { id: true },
      });
      if (existing[0]) {
        categoryId = existing[0].id;
      } else {
        const created = await api.category.create({ name: trimmed, user: { _link: userId } });
        categoryId = created.id;
      }
    }
  }

  const recipe = await api.recipe.create({
    ...recipeParameters,
    ...(categoryId === undefined ? {} : { category: { _link: categoryId } }),
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
    source,
    user: { _link: userId },
  });

  return { slug: recipe.slug };
}
