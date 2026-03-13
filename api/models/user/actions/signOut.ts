import type { ActionOptions, SignOutUserActionContext } from "gadget-server";

export const options: ActionOptions = {
  actionType: "update",
  triggers: {
    signOut: true,
  },
};

export async function run({ session }: SignOutUserActionContext): Promise<void> {
  // Unset the associated user on the active session
  session?.set("user", null);

  return Promise.resolve();
}
