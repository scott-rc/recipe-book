import { type ActionOptions, type DeleteRecipeActionContext, deleteRecord } from "gadget-server";

export const options: ActionOptions = {
  actionType: "delete",
};

export async function run({ record }: DeleteRecipeActionContext): Promise<void> {
  await deleteRecord(record);
}
