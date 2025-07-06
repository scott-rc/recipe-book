import { type ActionOptions, type SignOutUserActionContext } from "gadget-server";

export const options: ActionOptions = {
  actionType: "update",
  triggers: {
    signOut: true,
  },
};

export async function run({ session }: SignOutUserActionContext): Promise<void> {
  // unset the associated user on the active session
  session?.set("user", null);

  return Promise.resolve();
}
