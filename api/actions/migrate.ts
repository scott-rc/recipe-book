import { logger, type ActionOptions, type MigrateGlobalActionContext } from "gadget-server";

export const options: ActionOptions = {
  timeoutMS: 900000,
};

export async function run({ api }: MigrateGlobalActionContext): Promise<void> {
  let recipes = await api.actAsAdmin.recipe.findMany({
    first: 10,
    select: {
      id: true,
      name: true,
      ingredients: true,
      directions: true,
      nutrition: true,
    },
  });

  // oxlint-disable-next-line typescript/no-unnecessary-condition
  while (true) {
    for (const recipe of recipes) {
      logger.info({ id: recipe.id, name: recipe.name }, "migrating recipe");

      await api.actAsAdmin.internal.recipe.update(recipe.id, {
        ingredientsV2: typeof recipe.ingredients === "string" ? recipe.ingredients : (recipe.ingredients as string[]).join("\n- "),
        directionsV2: typeof recipe.directions === "string" ? recipe.directions : (recipe.directions as string[]).join("\n- "),
        nutritionV2: recipe.nutrition
          ? typeof recipe.nutrition === "string"
            ? recipe.nutrition
            : (recipe.nutrition as string[]).join("\n- ")
          : undefined,
      });
    }

    if (recipes.hasNextPage) {
      recipes = await recipes.nextPage();
    } else {
      break;
    }
  }
}
