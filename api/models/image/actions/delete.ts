import { ActionOptions, deleteRecord } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const options: ActionOptions = {
  actionType: "delete",
};

export const run: ActionRun = async ({ params, record }) => {
  await preventCrossUserDataAccess(params, record);
  await deleteRecord(record);
};
