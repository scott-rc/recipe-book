import { type ActionOptions, applyParams, type CreateRecipeActionContext, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const options: ActionOptions = {
  actionType: "create",
};

export async function run({ params, record, logger }: CreateRecipeActionContext): Promise<void> {
  logger.debug({ params, record }, "creating recipe");
  applyParams(params, record);
  record.slug = record.name.toLowerCase().replace(/\s+/g, "-");
  await preventCrossUserDataAccess(params, record);
  await save(record);
}
