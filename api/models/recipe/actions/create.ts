import { type ActionOptions, applyParams, type CreateRecipeActionContext, save } from "gadget-server";

export const options: ActionOptions = {
  actionType: "create",
};

export async function run({ params, record, logger }: CreateRecipeActionContext): Promise<void> {
  logger.debug({ params, record }, "creating recipe");
  applyParams(params, record);
  record.slug = record.name.toLowerCase().replace(/\s+/g, "-");
  await save(record);
}
