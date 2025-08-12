/* eslint-disable no-restricted-imports */
import type { ReactElement } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";
import { Button } from "../../components/ui/button";

export type LinkProps = RouterLinkProps;

export function Link({ children, ...linkProps }: LinkProps): ReactElement {
  return (
    <Button asChild variant="link">
      <RouterLink {...linkProps}>{children}</RouterLink>
    </Button>
  );
}
