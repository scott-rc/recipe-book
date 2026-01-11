import { Outlet, useOutletContext } from "react-router";
import { api } from "../api";
import type { Route } from "./+types/_app.r.$slug";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const recipe = await api.recipe.findBySlug(params.slug, {
    select: {
      id: true,
      name: true,
      slug: true,
      prepTime: true,
      cookTime: true,
      servingSize: true,
      source: true,
      ingredients: true,
      directions: true,
      nutrition: true,
      images: {
        edges: {
          cursor: true,
          node: {
            id: true,
            file: { url: true, mimeType: true },
            src: true,
            alt: true,
            width: true,
            height: true,
            index: true,
            userId: true,
          },
        },
      },
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
