import { applyParams, save, type ActionOptions, type VerifyEmailUserActionContext } from "gadget-server";

export const options: ActionOptions = {
  actionType: "custom",
  returnType: true,
  triggers: {
    verifiedEmail: true,
  },
};

export async function run({ params, record }: VerifyEmailUserActionContext): Promise<void> {
  applyParams(params, record);
  await save(record);
}
