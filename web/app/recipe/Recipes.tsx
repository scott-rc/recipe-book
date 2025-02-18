import { Skeleton } from "@radix-ui/themes";
import { Suspense, type ReactElement } from "react";
import { Outlet, type RouteObject } from "react-router-dom";
import { Recipe } from "./Recipe";
import { RecipeEdit } from "./RecipeEdit";
import { RecipeImport } from "./RecipeImport";
import { RecipeIndex } from "./RecipeIndex";

Recipes.route = {
  children: [RecipeIndex.route, RecipeEdit.route, Recipe.route, RecipeImport.route],
} satisfies RouteObject;

export function Recipes(): ReactElement {
  return (
    <Suspense fallback={<Skeleton />}>
      <Outlet />;
    </Suspense>
  );
}
