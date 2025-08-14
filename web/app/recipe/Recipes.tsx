import { Suspense, type ReactElement } from "react";
import { Outlet, type RouteObject } from "react-router-dom";
import { Recipe } from "./Recipe";
import { RecipeImport } from "./RecipeImport";
import { RecipeIndex } from "./RecipeIndex";

Recipes.route = {
  children: [RecipeIndex.route, Recipe.route, RecipeImport.route],
} satisfies RouteObject;

export function Recipes(): ReactElement {
  return (
    <Suspense fallback={<div className="h-screen w-screen animate-pulse bg-gray-100" />}>
      <Outlet />;
    </Suspense>
  );
}
