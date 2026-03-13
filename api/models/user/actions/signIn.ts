import { type ActionOptions, type SignInUserActionContext, applyParams, save } from "gadget-server";

export const options: ActionOptions = {
  actionType: "update",
  triggers: {
    emailSignIn: true,
    googleOAuthSignIn: true,
  },
};

export async function run({ params, record, session }: SignInUserActionContext): Promise<void> {
  applyParams(params, record);
  record.lastSignedIn = new Date();

  await save(record);

  // Associate the current user record with the active session
  session?.set("user", { _link: record.id });
}
