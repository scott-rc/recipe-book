import { Outlet, useOutletContext } from "react-router";

import { api } from "../api";
import type { Route } from "./+types/_app.r.$slug";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const recipe = await api.recipe.findBySlug(params.slug, {
    select: {
      category: { id: true, name: true },
      cookTime: true,
      directions: true,
      id: true,
      images: {
        edges: {
          cursor: true,
          node: {
            alt: true,
            file: { url: true, mimeType: true },
            height: true,
            id: true,
            index: true,
            src: true,
            userId: true,
            width: true,
          },
        },
      },
      ingredients: true,
      name: true,
      nutrition: true,
      prepTime: true,
      servingSize: true,
      slug: true,
      source: true,
    },
  });

  recipe.images.edges.sort((a, b) => (a.node.index ?? 0) - (b.node.index ?? 0));

  return recipe;
}

export type Recipe = Route.ComponentProps["loaderData"];

export interface RecipeOutletContext {
  recipe: Recipe;
}

export function useRecipe() {
  return useOutletContext<RecipeOutletContext>();
}

export default function RecipeRoute({ loaderData: recipe }: Route.ComponentProps) {
  return <Outlet context={{ recipe } satisfies RecipeOutletContext} />;
}
