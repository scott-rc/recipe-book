import { useAction, useAuth } from "@gadgetinc/react";
import { useEffect, useRef, type ReactElement } from "react";
import { useLocation, type RouteObject } from "react-router-dom";
import { api } from "../../api";
import { Link } from "../components/Link";

VerifyEmail.route = {
  path: "/verify-email",
  element: <VerifyEmail />,
} satisfies RouteObject;

export function VerifyEmail(): ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [{ error, data }, verifyEmail] = useAction(api.user.verifyEmail);
  const verificationAttempted = useRef(false);
  const { configuration } = useAuth();

  useEffect(() => {
    if (!verificationAttempted.current) {
      if (code) {
        void verifyEmail({ code });
      }
      verificationAttempted.current = true;
    }
  }, []);

  if (data) {
    return (
      <p className="format-message success">
        Email has been verified successfully. <Link to={configuration.signInPath}>Sign in now</Link>
      </p>
    );
  }

  if (error) {
    return <p className="format-message error">{error.message}</p>;
  }

  return <p className="format-message">Verifying email...</p>;
}
