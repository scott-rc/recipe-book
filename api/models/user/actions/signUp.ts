import { type ActionOptions, type SignUpUserActionContext, applyParams, save } from "gadget-server";

export const options: ActionOptions = {
  actionType: "create",
  returnType: true,
  triggers: {
    emailSignUp: true,
    googleOAuthSignUp: true,
  },
};

export async function run({ params, record, session }: SignUpUserActionContext): Promise<void> {
  applyParams(params, record);
  record.lastSignedIn = new Date();
  await save(record);

  if (record.emailVerified === true) {
    // Associate the current user record with the active session
    session?.set("user", { _link: record.id });
  }
}

export async function onSuccess({ record, api }: SignUpUserActionContext): Promise<void> {
  if (record.emailVerified !== true) {
    // Send the user a verification email if they have not yet verified
    await api.user.sendVerifyEmail({ email: record.email });
  }
}
