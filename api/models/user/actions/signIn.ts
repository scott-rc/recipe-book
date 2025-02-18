import { applyParams, save, type ActionOptions, type SignInUserActionContext } from "gadget-server";

export const options: ActionOptions = {
  actionType: "update",
  triggers: {
    googleOAuthSignIn: true,
    emailSignIn: true,
  },
};

export async function run({ params, record, session }: SignInUserActionContext): Promise<void> {
  applyParams(params, record);
  record.lastSignedIn = new Date();

  await save(record);

  // associate the current user record with the active session
  session?.set("user", { _link: record.id });
}
