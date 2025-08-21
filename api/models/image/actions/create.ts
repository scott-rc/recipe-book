import { ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const options: ActionOptions = {
  actionType: "create",
};

export const run: ActionRun = async ({ params, record }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);
  await save(record);
};
