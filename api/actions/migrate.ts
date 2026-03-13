import { type ActionOptions, type MigrateGlobalActionContext, logger } from "gadget-server";

export const options: ActionOptions = {
  timeoutMS: 900000,
};

export async function run({ api }: MigrateGlobalActionContext): Promise<void> {
  let recipes = await api.actAsAdmin.recipe.findMany({
    first: 50,
    filter: { favourite: { isSet: false } },
    select: { id: true, name: true },
  });

  // oxlint-disable-next-line typescript/no-unnecessary-condition
  while (true) {
    for (const recipe of recipes) {
      logger.info({ id: recipe.id, name: recipe.name }, "setting favourite to false");
      await api.actAsAdmin.internal.recipe.update(recipe.id, { favourite: false });
    }

    if (recipes.hasNextPage) {
      recipes = await recipes.nextPage();
    } else {
      break;
    }
  }
}
