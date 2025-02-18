import { applyParams, save, type ChangePasswordUserActionContext } from "gadget-server";

export const options = {
  actionType: "update",
  triggers: {
    changePassword: true,
  },
};

export async function run({ params, record }: ChangePasswordUserActionContext): Promise<void> {
  // Applies new 'password' to the user record and saves to database
  applyParams(params, record);
  await save(record);
}
