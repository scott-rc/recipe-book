import { SignedOutOrRedirect, useActionForm } from "@gadgetinc/react";
import type { ReactElement } from "react";
import type { RouteObject } from "react-router-dom";
import { api } from "../../api";

ForgotPassword.route = {
  path: "/forgot-password",
  element: (
    <SignedOutOrRedirect>
      <ForgotPassword />
    </SignedOutOrRedirect>
  ),
} satisfies RouteObject;

export function ForgotPassword(): ReactElement {
  const {
    submit,
    register,
    formState: { isSubmitSuccessful, isSubmitting },
  } = useActionForm(api.user.sendResetPassword);

  return isSubmitSuccessful ? (
    <p className="format-message success">Email has been sent. Please check your inbox.</p>
  ) : (
    <form className="custom-form" onSubmit={submit}>
      <h1 className="form-title">Reset password</h1>
      <input className="custom-input" placeholder="Email" {...register("email")} />
      <button disabled={isSubmitting} type="submit">
        Send reset link
      </button>
    </form>
  );
}
