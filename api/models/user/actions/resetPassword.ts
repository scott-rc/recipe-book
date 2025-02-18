import { applyParams, save, type ResetPasswordUserActionContext } from "gadget-server";

export const options = {
  actionType: "custom",
  returnType: true,
  triggers: {
    resetPassword: true,
  },
};

export async function run({ params, record }: ResetPasswordUserActionContext): Promise<void> {
  // Applies new 'password' to the user record and saves to database
  applyParams(params, record);
  await save(record);
}
