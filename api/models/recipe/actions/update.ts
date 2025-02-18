import { type ActionOptions, applyParams, save, type UpdateRecipeActionContext } from "gadget-server";

export const options: ActionOptions = {
  actionType: "update",
};

export async function run({ params, record, logger }: UpdateRecipeActionContext): Promise<void> {
  logger.debug({ params, record }, "updating recipe");
  applyParams(params, record);
  record.slug = record.name.toLowerCase().replace(/\s+/g, "-");
  await save(record);
}
