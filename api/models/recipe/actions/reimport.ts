import { type ActionOptions, type ReimportRecipeActionContext } from "gadget-server";
import { importRecipe } from "../../../lib/import";

export const options: ActionOptions = {
  actionType: "custom",
  transactional: false,
  timeoutMS: 900000,
};

export async function run({ record, logger, api }: ReimportRecipeActionContext): Promise<void> {
  logger.debug({ record }, "reimporting recipe");
  if (!record.source) {
    throw new Error("Recipe has no source");
  }

  const recipeParameters = await importRecipe(record.source);
  await api.recipe.update(record.id, {
    ...recipeParameters,
    name: undefined, // FIXME: causes uniqueness error
    images: [
      {
        _converge: {
          values: recipeParameters.images.map((image) => ({
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
