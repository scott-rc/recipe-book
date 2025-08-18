import { Link } from "react-router";
import { api } from "../api";
import type { Route } from "./+types/_auth.verify-email";

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  try {
    await api.user.verifyEmail({ code });
    return { success: true, error: null };
  } catch (error) {
    return {
      error: { message: (error as Error).message },
      success: false,
    };
  }
};

export default function ({ loaderData }: Route.ComponentProps) {
  const { success, error } = loaderData;
  if (error) {
    return <p className="format-message error">{error.message}</p>;
  }

  return success ? (
    <p className="format-message success">
      Email has been verified successfully. <Link to="/sign-in">Sign in now</Link>
    </p>
  ) : null;
}
