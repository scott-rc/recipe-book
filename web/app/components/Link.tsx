/* eslint-disable no-restricted-imports */
import { Link as RadixLink, type LinkProps as RadixLinkProps } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";

export type LinkProps = RadixLinkProps & RouterLinkProps;

export function Link({ children, ...linkProps }: LinkProps): ReactElement {
  return (
    <RadixLink asChild {...linkProps}>
      <RouterLink {...linkProps}>{children}</RouterLink>
    </RadixLink>
  );
}
