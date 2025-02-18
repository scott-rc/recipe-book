import { deleteRecord, type DeleteUserActionContext } from "gadget-server";

export const options = {
  actionType: "delete",
};

export async function run({ record }: DeleteUserActionContext): Promise<void> {
  await deleteRecord(record);
}
