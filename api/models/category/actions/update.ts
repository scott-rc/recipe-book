import { type ActionOptions, applyParams, save } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const options: ActionOptions = {
  actionType: "update",
};

export const run: ActionRun = async ({ params, record }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);
  if (record.name) {
    record.name = record.name.trim();
  }
  await save(record);
};
