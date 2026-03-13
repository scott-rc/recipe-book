import type { ActionOptions, ReimportRecipeActionContext } from "gadget-server";

import { importRecipe } from "../../../lib/import";

export const options: ActionOptions = {
  actionType: "custom",
  timeoutMS: 900000,
  transactional: false,
};

export async function run({ record, logger, api }: ReimportRecipeActionContext): Promise<void> {
  logger.debug({ record }, "reimporting recipe");
  if (record.source === null || record.source === undefined || record.source === "") {
    throw new Error("Recipe has no source");
  }

  const { name: _name, images: importedImages, category: _category, ...recipeParameters } = await importRecipe(record.source);
  await api.recipe.update(record.id, {
    ...recipeParameters,
    images: [
      {
        _converge: {
          values: importedImages.map((image) => ({
            alt: image.alt,
            file: { copyURL: image.src },
            height: image.height,
            src: image.src,
            user: { _link: record.userId },
            width: image.width,
          })),
        },
      },
    ],
  });
}
