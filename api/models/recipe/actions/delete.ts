import { type ActionOptions, type DeleteRecipeActionContext, deleteRecord } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const options: ActionOptions = {
  actionType: "delete",
};

export async function run({ record, params, logger }: DeleteRecipeActionContext): Promise<void> {
  logger.debug({ record, params }, "deleting recipe");
  await preventCrossUserDataAccess(params, record);
  await deleteRecord(record);
}
