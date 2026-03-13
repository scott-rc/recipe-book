import { useActionForm } from "@gadgetinc/react";
import { EllipsisVerticalIcon, ExternalLinkIcon, HeartIcon, LoaderCircleIcon, PencilIcon, RefreshCcwIcon, TrashIcon } from "lucide-react";
import type { ReactElement } from "react";
import { href, useNavigate, useRevalidator } from "react-router";
import { Form, Link, useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import { api } from "../api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "../components/ui/menubar";
import { cn } from "../lib/utils";
import type { Route } from "./+types/_app._index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("s");
  const categoryFilter = searchParams.get("c");

  const [recipes, categories] = await Promise.all([
    api.recipe.findMany({
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(categoryFilter ? { filter: { categoryId: { equals: categoryFilter } } } : {}),
      sort: [{ favourite: "Ascending" }, { slug: "Ascending" }],
      select: {
        category: { id: true, name: true },
        cookTime: true,
        favourite: true,
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
              width: true,
            },
          },
        },
        name: true,
        prepTime: true,
        servingSize: true,
        slug: true,
        source: true,
      },
    }),
    api.category.findMany({
      select: { id: true, name: true },
      sort: { name: "Ascending" },
    }),
  ]);

  for (const recipe of recipes) {
    recipe.images.edges.sort((a, b) => (a.node.index ?? 0) - (b.node.index ?? 0));
  }

  return { categories, recipes };
}

export type Recipe = Route.ComponentProps["loaderData"]["recipes"][number];

export default function IndexRoute({ loaderData: { recipes, categories } }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const setDebouncedSearchParams = useDebouncedCallback(
    (s: string) =>
      setSearchParams(
        (prev) => {
          if (s) {
            prev.set("s", s);
          } else {
            prev.delete("s");
          }
          return prev;
        },
        { replace: true, viewTransition: true },
      ),
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
      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = searchParams.get("c") === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setSearchParams(
                    (prev) => {
                      if (isActive) {
                        prev.delete("c");
                      } else {
                        prev.set("c", category.id);
                      }
                      return prev;
                    },
                    { replace: true, viewTransition: true },
                  );
                }}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground border-transparent" : "bg-background text-foreground hover:bg-accent",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {recipes.length === 0 && (
          <div className="mt-8">
            <h1 className="text-center">No recipes found</h1>
          </div>
        )}

        {recipes.map((recipe) => {
          const image = recipe.images.edges[0]?.node ?? {
            alt: "Placeholder",
            file: { mimeType: "image/svg+xml", url: "/placeholder.svg" },
            height: 500,
            id: "placeholder",
            width: 500,
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
                  <div className="flex flex-col gap-0.5">
                    <span className={cn("line-clamp-none leading-tight font-semibold @xs:text-xl @sm:text-2xl")}>{recipe.name}</span>
                    {recipe.category && <span className="text-muted-foreground text-xs">{recipe.category.name}</span>}
                  </div>
                  <div className="flex items-center">
                    <FavouriteButton recipe={recipe} />
                    <RecipeMenu recipe={recipe} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FavouriteButton({ recipe }: { recipe: Recipe }): ReactElement {
  const revalidator = useRevalidator();

  return (
    <div
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          await api.recipe.update(recipe.id, { favourite: !recipe.favourite });
          revalidator.revalidate();
        }}
      >
        <HeartIcon className={cn("size-4", recipe.favourite && "fill-current text-red-500")} />
      </Button>
    </div>
  );
}

export function RecipeMenu({ recipe, className }: { recipe: Recipe; className?: string }): ReactElement {
  const navigate = useNavigate();

  const { submit: reimport, formState: reimportState } = useActionForm(api.recipe.reimport, {
    onSuccess: async () => {
      await navigate(href("/r/:slug", { slug: recipe.slug }), { replace: true, viewTransition: true });
    },
    values: { id: recipe.id },
  });

  const { submit: deleteRecipe, formState: deleteRecipeState } = useActionForm(api.recipe.delete, {
    onSuccess: async () => {
      await navigate(href("/"), { viewTransition: true });
    },
    values: { id: recipe.id },
  });

  const isReimporting = reimportState.isSubmitting;
  const isDeleting = deleteRecipeState.isSubmitting;
  const isSubmitting = isReimporting || isDeleting;

  return (
    <Menubar
      className={cn("border-none p-0 shadow-none", className)}
      onClick={(event) => {
        event.preventDefault(); // Prevent parent anchor tags from triggering navigation
      }}
    >
      <MenubarMenu>
        <MenubarTrigger>
          <EllipsisVerticalIcon className="size-4" />
        </MenubarTrigger>
        <MenubarContent
          align="end"
          onClick={(event) => {
            event.stopPropagation(); // Prevent menubar from preventing child anchor tags from triggering navigation
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
              event.preventDefault(); // Prevent the menu from closing
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
              event.preventDefault(); // Prevent the menu from closing
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
