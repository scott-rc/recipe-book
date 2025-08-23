import type { AvailableRecipeSelection } from "@gadget-client/recipe-book";
import { useActionForm } from "@gadgetinc/react";
import {
  CheckIcon,
  ChefHatIcon,
  ClockIcon,
  EllipsisIcon,
  LinkIcon,
  ListIcon,
  LoaderCircleIcon,
  LockIcon,
  PencilIcon,
  RefreshCcwIcon,
  ScaleIcon,
  TimerIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import ms from "ms";
import { useEffect, useState, type PropsWithChildren, type ReactElement } from "react";
import { href, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { Markdown } from "../components/markdown";
import { Button } from "../components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "../components/ui/menubar";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";
import type { Route } from "./+types/_app.r.$slug";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return await api.recipe.findBySlug(params.slug, {
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
            alt: true,
            width: true,
            height: true,
          },
        },
      },
    },
  });
}

type Recipe = Awaited<ReturnType<typeof clientLoader>>;

export default function ({ loaderData: recipe }: Route.ComponentProps) {
  const navigate = useNavigate();

  const { submit: reimport, formState: reimportState } = useActionForm(api.recipe.reimport, {
    values: { id: recipe.id },
    onSuccess: async () => {
      await navigate(href("/r/:slug", { slug: recipe.slug }), { replace: true });
    },
    onError(error) {
      console.error("failed to reimport recipe", error);
    },
  });

  const { submit: deleteRecipe, formState: deleteRecipeState } = useActionForm(api.recipe.delete, {
    values: { id: recipe.id },
    onSuccess: async () => {
      await navigate(href("/"), { replace: true });
    },
  });

  return (
    <div className="h-full pb-32">
      <div className="mb-8 flex flex-col rounded-xl border p-8 shadow-sm">
        <Menubar className="self-end border-none shadow-none">
          <MenubarMenu>
            <MenubarTrigger>
              <EllipsisIcon className="h-4 w-4" />
            </MenubarTrigger>
            <MenubarContent align="end">
              <MenubarItem
                disabled={reimportState.isSubmitting}
                onSelect={async (event) => {
                  event.preventDefault();
                  await reimport();
                }}
              >
                {reimportState.isSubmitting ? (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcwIcon className="h-4 w-4" />
                )}
                Reimport
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                variant="destructive"
                disabled={deleteRecipeState.isSubmitting}
                onSelect={async (event) => {
                  event.preventDefault();
                  await deleteRecipe();
                }}
              >
                {deleteRecipeState.isSubmitting ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <TrashIcon className="h-4 w-4" />}
                Delete
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <div className="grid grid-cols-2 gap-16">
          <div className="flex flex-col justify-between gap-4">
            <RecipeHeading recipe={recipe} />
            <div className="grid grid-cols-2 gap-4">
              <RecipePrepTime recipe={recipe} />
              <RecipeCookTime recipe={recipe} />
              <RecipeServingSize recipe={recipe} />
              <RecipeSource recipe={recipe} />
            </div>
          </div>

          <RecipeImages recipe={recipe} />
        </div>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/3">
          <div className="rounded-lg border p-6 shadow-sm">
            <RecipeIngredients recipe={recipe} />
          </div>
        </div>
        <div className="lg:w-2/3">
          <div className="rounded-lg border p-6 shadow-sm">
            <RecipeDirections recipe={recipe} />
          </div>
          {recipe.nutrition && (
            <div className="mt-8 rounded-lg border p-6 shadow-sm">
              <RecipeNutrition recipe={recipe} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecipeWakeLock(): ReactElement {
  const [wakeLock, setWakeLock] = useState(false);

  useEffect(() => {
    if (!wakeLock) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    let wakeLockPromise: Promise<WakeLockSentinel | void> | undefined;
    if ("wakeLock" in navigator) {
      wakeLockPromise = navigator.wakeLock.request("screen").catch((error: unknown) => console.error(error));
    }
    return () => {
      wakeLockPromise?.then((wakeLock) => wakeLock?.release()).catch((error: unknown) => console.error(error));
    };
  }, [wakeLock]);

  return (
    <div className="mt-2 flex items-center gap-2 self-start">
      <Label htmlFor="cook-mode" className="flex items-center gap-2 text-sm">
        <LockIcon className="h-4 w-4" />
        <span className="hidden text-nowrap md:inline">Cook Mode</span>
        <Switch id="cook-mode" checked={wakeLock} onCheckedChange={setWakeLock} />
      </Label>
    </div>
  );
}

function RecipeImages({ recipe }: { recipe: Recipe }): ReactElement {
  let images = recipe.images.edges.map((image) => image.node);
  if (!images.length) {
    images = [
      {
        id: "placeholder",
        height: 400,
        width: 600,
        file: { url: "/placeholder.svg", mimeType: "image/svg+xml" },
        alt: "Placeholder",
      },
    ];
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <img
              className="aspect-3/2 rounded-lg object-cover"
              src={image.file.url}
              alt={image.alt ?? "Recipe image"}
              width={image.width ?? undefined}
              height={image.height ?? undefined}
              loading="lazy"
              decoding="async"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
}

function RecipeHeading({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "name" });

  if (isEditing) {
    return (
      <Editable>
        <div className="flex items-center gap-2">
          <Input {...form.register("name")} className="min-w-[400px] text-center text-3xl font-bold" />
          <SaveButton />
          <CancelButton />
        </div>
      </Editable>
    );
  }

  return (
    <Editable>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <h1 className="inline-block max-w-lg text-4xl font-bold text-balance">{recipe.name}</h1>
          <EditButton />
        </div>
      </div>
    </Editable>
  );
}

function RecipeSource({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "source" });
  const length = recipe.source?.length ?? 80;

  return (
    <Editable className="overflow-hidden rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <LinkIcon className="h-4 w-4" />
        <span>Source</span>
        {isEditing ? (
          <>
            <SaveButton />
            <CancelButton />
          </>
        ) : (
          <EditButton />
        )}
      </div>

      {isEditing ? (
        <Input {...form.register("source")} style={{ minWidth: length * 8 }} />
      ) : recipe.source ? (
        <div className="flex">
          <Link to={recipe.source} className="truncate text-sm hover:underline" target="_blank">
            {recipe.source}
          </Link>
        </div>
      ) : (
        <span className="text-sm text-gray-400">No source</span>
      )}
    </Editable>
  );
}

function RecipeServingSize({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "servingSize" });

  return (
    <Editable className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <UsersIcon className="h-4 w-4" />
        <span>Serves</span>
        {isEditing ? (
          <>
            <SaveButton />
            <CancelButton />
          </>
        ) : (
          <EditButton />
        )}
      </div>
      {isEditing ? (
        <Input {...form.register("servingSize", { valueAsNumber: true })} type="number" required maxLength={2} className="text-center" />
      ) : (
        <p className="text-lg font-semibold">{recipe.servingSize}</p>
      )}
    </Editable>
  );
}

function RecipePrepTime({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "prepTime" });
  const [prepTime, setPrepTime] = useState(ms(recipe.prepTime, { long: true }));

  useEffect(() => {
    if (!prepTime) {
      return;
    }

    try {
      const parsed = ms(prepTime as ms.StringValue);
      form.setValue("prepTime", parsed);
    } catch {
      console.log("invalid prep time", prepTime);
      form.setError("prepTime", { message: "Invalid prep time" });
    }
  }, [form, prepTime]);

  return (
    <Editable className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ClockIcon className="h-4 w-4" />
        <span>Prep Time</span>
        {isEditing ? (
          <>
            <SaveButton />
            <CancelButton />
          </>
        ) : (
          <EditButton />
        )}
      </div>
      {isEditing ? (
        <Input name="prepTime" value={prepTime} onChange={(event) => setPrepTime(event.currentTarget.value)} required />
      ) : (
        <p className="text-lg font-semibold">{ms(recipe.prepTime, { long: true })}</p>
      )}
    </Editable>
  );
}

function RecipeCookTime({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "cookTime" });
  const [cookTime, setCookTime] = useState(ms(recipe.cookTime, { long: true }));

  useEffect(() => {
    if (!cookTime) {
      return;
    }

    try {
      const parsed = ms(cookTime as ms.StringValue);
      form.setValue("cookTime", parsed);
    } catch {
      console.log("invalid prep time", cookTime);
    }
  }, [form, cookTime]);

  return (
    <Editable className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <TimerIcon className="h-4 w-4" />
        <span> Cook Time</span>
        {isEditing ? (
          <>
            <SaveButton />
            <CancelButton />
          </>
        ) : (
          <EditButton />
        )}
      </div>
      {isEditing ? (
        <Input value={cookTime} onChange={(event) => setCookTime(event.currentTarget.value)} required />
      ) : (
        <p className="text-lg font-semibold">{ms(recipe.cookTime, { long: true })}</p>
      )}
    </Editable>
  );
}

function RecipeIngredients({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "ingredients" });
  const ingredients = recipe.ingredients as string | string[];

  if (isEditing) {
    const rows = typeof ingredients === "string" ? ingredients.split("\n").length + 8 : ingredients.length + 8;

    return (
      <Editable>
        <div className="mb-4 flex items-center gap-2">
          <ListIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Ingredients</h2>
          <SaveButton />
          <CancelButton />
        </div>
        <Textarea {...form.register("ingredients")} rows={rows} className="resize-none" />
      </Editable>
    );
  }

  if (typeof ingredients === "string") {
    return (
      <Editable>
        <div className="mb-4 flex items-center gap-2">
          <ListIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Ingredients</h2>
          <EditButton />
        </div>
        <div className="prose max-w-none">
          <Markdown>{ingredients}</Markdown>
        </div>
      </Editable>
    );
  }

  return (
    <Editable>
      <div className="mb-4 flex items-center gap-2">
        <ListIcon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Ingredients</h2>
        <EditButton />
      </div>
      <ul className="space-y-2">
        {ingredients.map((ingredient) => (
          <li key={ingredient} className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"></span>
            <p className="leading-relaxed text-gray-700">{ingredient}</p>
          </li>
        ))}
      </ul>
    </Editable>
  );
}

function RecipeDirections({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "directions" });
  const directions = recipe.directions as string | string[];

  if (isEditing) {
    const rows = typeof directions === "string" ? directions.split("\n").length + 8 : directions.length + 8;

    return (
      <Editable>
        <div className="mb-4 flex items-center gap-2">
          <ChefHatIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Directions</h2>
          <SaveButton />
          <CancelButton />
        </div>
        <Textarea {...form.register("directions")} rows={rows} className="mt-3 resize-y" />
      </Editable>
    );
  }

  return (
    <Editable>
      <div className="flex items-center justify-between">
        <div className="mb-4 flex items-center gap-2">
          <ChefHatIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Directions</h2>
          <EditButton />
        </div>
        <RecipeWakeLock />
      </div>
      <ul>
        {typeof directions === "string" ? (
          <Markdown>{directions}</Markdown>
        ) : (
          directions.map((direction) => (
            <li key={direction}>
              <p>{direction}</p>
            </li>
          ))
        )}
      </ul>
    </Editable>
  );
}

function RecipeNutrition({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveButton, CancelButton } = useRecipeForm({ recipe, property: "nutrition" });

  if (!recipe.nutrition) {
    return <></>;
  }

  const nutrition = recipe.nutrition as string | string[];
  const rows = typeof nutrition === "string" ? nutrition.split("\n").length + 8 : nutrition.length + 8;

  if (isEditing) {
    return (
      <Editable>
        <div className="mb-4 flex items-center gap-2">
          <ScaleIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Nutrition</h2>
          <SaveButton />
          <CancelButton />
        </div>
        <Textarea {...form.register("nutrition")} rows={rows} className="mt-3" />
      </Editable>
    );
  }

  if (typeof nutrition === "string") {
    return (
      <Editable>
        <div className="mb-4 flex items-center gap-2">
          <ScaleIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Nutrition</h2>
          <EditButton />
        </div>
        <Markdown>{nutrition}</Markdown>
      </Editable>
    );
  }

  return (
    <Editable>
      <div className="mb-4 flex items-center gap-2">
        <ScaleIcon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Nutrition</h2>
        <EditButton />
      </div>

      <ul>
        {nutrition.map((n) => (
          <li key={n}>
            <p>{n}</p>
          </li>
        ))}
      </ul>
    </Editable>
  );
}

function useRecipeForm({
  recipe,
  property,
  selectExtra,
  onSuccess,
}: {
  recipe: Recipe;
  property: keyof Recipe;
  selectExtra?: AvailableRecipeSelection;
  onSuccess?: (recipe: Recipe) => Promise<void> | void;
}) {
  const navigate = useNavigate();
  const [isEditing, setEditing] = useState(false);
  const form = useActionForm(api.recipe.update, {
    select: { id: true, [property]: true, slug: true, ...selectExtra },
    send: ["id", property as string],
    defaultValues: recipe,
    onSuccess: async (recipe) => {
      setEditing(false);
      await navigate(href("/r/:slug", { slug: recipe.slug }), { replace: true });
      await onSuccess?.(recipe as unknown as Recipe);
    },
  });

  function Editable({ className, children }: PropsWithChildren<{ className?: string }>): ReactElement {
    const error: { message?: string } | undefined | null = form.formState.errors[property] ?? form.error;

    return (
      <form onSubmit={form.submit} className={cn("group", className)}>
        {children}
        {error && <p className="text-red-500">{error.message}</p>}
      </form>
    );
  }

  function EditButton(): ReactElement {
    return (
      <Button
        className="invisible transition-colors group-hover:visible"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setEditing(true)}
      >
        <PencilIcon />
      </Button>
    );
  }

  function SaveButton(): ReactElement {
    return (
      <Button type="submit" disabled={form.formState.isLoading} variant="ghost" size="icon">
        <CheckIcon />
      </Button>
    );
  }

  function CancelButton(): ReactElement {
    return (
      <Button type="button" onClick={() => setEditing(false)} variant="ghost" size="icon">
        <XIcon />
      </Button>
    );
  }

  return {
    form,
    isEditing,
    Editable,
    EditButton,
    SaveButton,
    CancelButton,
  };
}
