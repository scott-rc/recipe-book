import { type DeleteUserActionContext, deleteRecord } from "gadget-server";

export const options = {
  actionType: "delete",
};

export async function run({ record }: DeleteUserActionContext): Promise<void> {
  await deleteRecord(record);
}
