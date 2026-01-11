import { useActionForm } from "@gadgetinc/react";
import { EllipsisVerticalIcon, ExternalLinkIcon, LoaderCircleIcon, PencilIcon, RefreshCcwIcon, TrashIcon } from "lucide-react";
import { type ReactElement } from "react";
import { href, useNavigate } from "react-router";
import { Form, Link, useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { api } from "../api";
import { Input } from "../components/ui/input";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "../components/ui/menubar";
import { cn } from "../lib/utils";
import type { Route } from "./+types/_app._index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const recipes = await api.recipe.findMany({
    search: new URL(request.url).searchParams.get("s"),
    select: {
      id: true,
      name: true,
      slug: true,
      prepTime: true,
      cookTime: true,
      servingSize: true,
      source: true,
      images: {
        edges: {
          cursor: true,
          node: {
            id: true,
            file: { url: true, mimeType: true },
            alt: true,
            width: true,
            height: true,
            index: true,
          },
        },
      },
    },
  });

  for (const recipe of recipes) {
    recipe.images.edges.sort((a, b) => (a.node.index ?? 0) - (b.node.index ?? 0));
  }

  return recipes;
}

export type Recipe = Route.ComponentProps["loaderData"][number];

export default function IndexRoute({ loaderData: recipes }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const setDebouncedSearchParams = useDebouncedCallback(
    (s: string) => setSearchParams(s ? { s } : {}, { replace: true, viewTransition: true }),
    250,
  );

  return (
    <div>
      <Form>
        <Input
          autoFocus
          className="p-6"
          placeholder="Search recipes"
          name="s"
          defaultValue={searchParams.get("s") ?? ""}
          onChange={(e) => setDebouncedSearchParams(e.currentTarget.value)}
        />
      </Form>
      <div className="mt-4 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {recipes.length === 0 && (
          <div className="mt-8">
            <h1 className="text-center">No recipes found</h1>
          </div>
        )}

        {recipes.map((recipe) => {
          const image = recipe.images.edges[0]?.node ?? {
            id: "placeholder",
            height: 500,
            width: 500,
            file: { url: "/placeholder.svg", mimeType: "image/svg+xml" },
            alt: "Placeholder",
          };

          return (
            <Link key={recipe.id} to={href("/r/:slug", { slug: recipe.slug })} viewTransition className="@container">
              <div className="flex h-full max-w-md min-w-60 flex-col gap-4 overflow-hidden">
                <img
                  className="aspect-square rounded-md object-cover"
                  src={image.file.url}
                  alt={image.alt ?? "Recipe image"}
                  width={image.width ?? undefined}
                  height={image.height ?? undefined}
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex items-baseline justify-between">
                  <span className={cn("line-clamp-none leading-tight font-semibold @xs:text-xl @sm:text-2xl")}>{recipe.name}</span>
                  <RecipeMenu recipe={recipe} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function RecipeMenu({ recipe, className }: { recipe: Recipe; className?: string }): ReactElement {
  const navigate = useNavigate();

  const { submit: reimport, formState: reimportState } = useActionForm(api.recipe.reimport, {
    values: { id: recipe.id },
    onSuccess: async () => {
      await navigate(href("/r/:slug", { slug: recipe.slug }), { replace: true, viewTransition: true });
    },
  });

  const { submit: deleteRecipe, formState: deleteRecipeState } = useActionForm(api.recipe.delete, {
    values: { id: recipe.id },
    onSuccess: async () => {
      await navigate(href("/"), { viewTransition: true });
    },
  });

  const isReimporting = reimportState.isSubmitting;
  const isDeleting = deleteRecipeState.isSubmitting;
  const isSubmitting = isReimporting || isDeleting;

  return (
    <Menubar
      className={cn("border-none p-0 shadow-none", className)}
      onClick={(event) => {
        event.preventDefault(); // prevent parent anchor tags from triggering navigation
      }}
    >
      <MenubarMenu>
        <MenubarTrigger>
          <EllipsisVerticalIcon className="size-4" />
        </MenubarTrigger>
        <MenubarContent
          align="end"
          onClick={(event) => {
            event.stopPropagation(); // prevent menubar from preventing child anchor tags from triggering navigation
          }}
        >
          {recipe.source && (
            <MenubarItem asChild>
              <Link to={recipe.source} target="_blank">
                <ExternalLinkIcon className="size-4" />
                Source
              </Link>
            </MenubarItem>
          )}
          <MenubarSeparator />
          <MenubarItem asChild disabled={isSubmitting}>
            <Link to={href("/r/:slug/edit", { slug: recipe.slug })} viewTransition>
              <PencilIcon className="size-4" />
              Edit
            </Link>
          </MenubarItem>
          <MenubarItem
            disabled={isSubmitting}
            onSelect={async (event) => {
              event.preventDefault(); // prevent the menu from closing
              await reimport();
            }}
          >
            {isReimporting ? <LoaderCircleIcon className="size-4 animate-spin" /> : <RefreshCcwIcon className="size-4" />}
            Reimport
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            variant="destructive"
            disabled={isSubmitting}
            onSelect={async (event) => {
              event.preventDefault(); // prevent the menu from closing
              await deleteRecipe();
            }}
          >
            {isDeleting ? <LoaderCircleIcon className="size-4 animate-spin" /> : <TrashIcon className="size-4" />}
            Delete
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
