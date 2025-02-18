import { applyParams, save, type ActionOptions, type UpdateUserActionContext } from "gadget-server";

export const options: ActionOptions = {
  actionType: "update",
};

export async function run({ params, record }: UpdateUserActionContext): Promise<void> {
  applyParams(params, record);
  await save(record);
}
