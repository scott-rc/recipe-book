import { SignedInOrRedirect, useActionForm, useUser } from "@gadgetinc/react";
import type { ReactElement } from "react";
import { type RouteObject } from "react-router-dom";
import { api } from "../../api";
import { Link } from "../components/Link";

ChangePassword.route = {
  path: "/change-password",
  element: (
    <SignedInOrRedirect>
      <ChangePassword />
    </SignedInOrRedirect>
  ),
} satisfies RouteObject;

export function ChangePassword(): ReactElement {
  const user = useUser(api);
  const { submit, register, formState } = useActionForm(api.user.changePassword, { defaultValues: user });

  if (formState.isSubmitSuccessful) {
    return (
      <p className="format-message success">
        Password changed successfully. <Link to="/signed-in">Back to profile</Link>
      </p>
    );
  }

  return (
    <form className="custom-form" onSubmit={submit}>
      <h1 className="form-title">Change password</h1>
      <input className="custom-input" type="password" placeholder="Current password" {...register("currentPassword")} />
      <input className="custom-input" type="password" placeholder="New password" {...register("newPassword")} />
      {formState.errors.user?.password?.message && (
        <p className="format-message error">Password: {formState.errors.user.password.message}</p>
      )}

      {formState.errors.root?.message && <p className="format-message error">{formState.errors.root.message}</p>}

      <Link to="/signed-in">Back to profile</Link>
      <button disabled={formState.isSubmitting} type="submit">
        Change password
      </button>
    </form>
  );
}
