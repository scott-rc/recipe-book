import type { AvailableRecipeSelection, RecipeRecord } from "@gadget-client/recipe-book";
import { useActionForm, type DeepPartial } from "@gadgetinc/react";
import {
  CheckIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  LoaderCircleIcon,
  PencilIcon,
  RefreshCcwIcon,
  TimerIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import ms from "ms";
import { ReactElement, useEffect, useState, type PropsWithChildren } from "react";
import { href, Link, useBlocker, useNavigate } from "react-router";
import { api } from "../api";
import { cn } from "../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Input } from "./ui/input";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "./ui/menubar";

export const recipeSelections = {
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
      },
    },
  },
} satisfies AvailableRecipeSelection;

type Recipe = RecipeRecord<typeof recipeSelections>;

export function RecipeCard({ recipe }: { recipe: Recipe }): ReactElement {
  return (
    <Card key={recipe.id}>
      <CardContent className="flex flex-col">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-16">
          <RecipeImage image={recipe.images.edges[0]?.node} />
          <div className="flex flex-col justify-between gap-4">
            <div className="flex justify-between">
              <RecipeHeading recipe={recipe} />
              <RecipeMenu recipe={recipe} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <RecipePrepTime recipe={recipe} />
              <RecipeCookTime recipe={recipe} />
              <RecipeServingSize recipe={recipe} />
              <RecipeSource recipe={recipe} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecipeMenu({ recipe }: { recipe: Recipe }): ReactElement {
  const navigate = useNavigate();

  const { submit: reimport, formState: reimportState } = useActionForm(api.recipe.reimport, {
    values: { id: recipe.id },
    onSuccess: async () => {
      blocker.reset?.();
      await navigate(href("/r/:slug", { slug: recipe.slug }), { replace: true, viewTransition: true });
    },
  });

  const { submit: deleteRecipe, formState: deleteRecipeState } = useActionForm(api.recipe.delete, {
    values: { id: recipe.id },
    onSuccess: async () => {
      blocker.reset?.();
      await navigate(href("/"), { replace: true, viewTransition: true });
    },
  });

  const isSubmitting = reimportState.isSubmitting || deleteRecipeState.isSubmitting;
  const blocker = useBlocker(isSubmitting);

  return (
    <>
      <Menubar className="border-none shadow-none">
        <MenubarMenu>
          <MenubarTrigger
            onClick={(event) => {
              event.preventDefault(); // prevent wrapping <Link> elements from being clicked
            }}
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </MenubarTrigger>
          <MenubarContent align="end">
            <MenubarItem
              disabled={isSubmitting}
              onSelect={async (event) => {
                event.preventDefault(); // prevent the menu from closing
                await reimport();
              }}
            >
              {reimportState.isSubmitting ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <RefreshCcwIcon className="h-4 w-4" />}
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
              {deleteRecipeState.isSubmitting ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <TrashIcon className="h-4 w-4" />}
              Delete
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <AlertDialog open={blocker.state === "blocked" && isSubmitting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              You are currently {reimportState.isSubmitting ? "reimporting" : "deleting"} {recipe.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={blocker.reset}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={blocker.proceed}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function RecipeImage({ image }: { image: Recipe["images"]["edges"][number]["node"] | null | undefined }): ReactElement {
  image ??= {
    id: "placeholder",
    height: 500,
    width: 500,
    file: { url: "/placeholder.svg", mimeType: "image/svg+xml" },
    alt: "Placeholder",
  };

  return (
    <img
      className="aspect-square rounded-lg object-cover"
      src={image.file.url}
      alt={image.alt ?? "Recipe image"}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      loading="lazy"
      decoding="async"
    />
  );
}

export function RecipeImages({ recipe }: { recipe: Recipe }): ReactElement {
  let images = recipe.images.edges.map((image) => image.node);
  if (!images.length) {
    images = [
      {
        id: "placeholder",
        height: 500,
        width: 500,
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
            <RecipeImage image={image} />
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

export function RecipeHeading({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "name" });

  return (
    <Editable>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          {isEditing ? (
            <>
              <Input {...form.register("name")} className="min-w-[400px] text-center text-3xl font-bold" />
              <SaveCancelButtons />
            </>
          ) : (
            <>
              <h1 className="inline-block max-w-lg text-4xl font-bold text-pretty sm:text-balance">{recipe.name}</h1>
              <EditButton />
            </>
          )}
        </div>
      </div>
    </Editable>
  );
}

export function RecipePrepTime({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "prepTime" });
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
    <Editable className="flex flex-col justify-center rounded-lg border px-2 py-1 shadow-sm">
      <div className="flex items-center">
        <ClockIcon className="h-4 w-4" />
        <span className="ml-1 text-sm font-medium">Prep Time</span>
        {isEditing ? <SaveCancelButtons /> : <EditButton />}
      </div>
      {isEditing ? (
        <Input name="prepTime" value={prepTime} onChange={(event) => setPrepTime(event.currentTarget.value)} required />
      ) : (
        <p className="text-sm font-semibold">{ms(recipe.prepTime, { long: true })}</p>
      )}
    </Editable>
  );
}

export function RecipeCookTime({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "cookTime" });
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
    <Editable className="flex flex-col justify-center rounded-lg border px-2 py-1 shadow-sm">
      <div className="flex items-center">
        <TimerIcon className="h-4 w-4" />
        <span className="ml-1 text-sm font-medium">Cook Time</span>
        {isEditing ? <SaveCancelButtons /> : <EditButton />}
      </div>
      {isEditing ? (
        <Input value={cookTime} onChange={(event) => setCookTime(event.currentTarget.value)} required />
      ) : (
        <p className="text-sm font-semibold">{ms(recipe.cookTime, { long: true })}</p>
      )}
    </Editable>
  );
}

export function RecipeServingSize({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "servingSize" });

  return (
    <Editable className="flex flex-col justify-center rounded-lg border px-2 py-1 shadow-sm">
      <div className="flex items-center">
        <UsersIcon className="h-4 w-4" />
        <span className="ml-1 text-sm font-medium">Serves</span>
        {isEditing ? <SaveCancelButtons /> : <EditButton />}
      </div>
      {isEditing ? (
        <Input {...form.register("servingSize", { valueAsNumber: true })} type="number" required maxLength={2} className="text-center" />
      ) : (
        <p className="text-sm font-semibold">{recipe.servingSize}</p>
      )}
    </Editable>
  );
}

export function RecipeSource({ recipe }: { recipe: Recipe }): ReactElement {
  const { form, isEditing, Editable, EditButton, SaveCancelButtons } = useRecipeForm({ recipe, property: "source" });
  const length = recipe.source?.length ?? 80;

  return (
    <Editable className="flex flex-col justify-center rounded-lg border px-2 py-1 shadow-sm">
      <div className="flex items-center">
        <LinkIcon className="h-4 w-4" />
        <span className="ml-1 text-sm font-medium">Source</span>
        {isEditing ? <SaveCancelButtons /> : <EditButton />}
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

export function useRecipeForm<T extends RecipeRecord<typeof recipeSelections> = RecipeRecord<typeof recipeSelections>>({
  recipe,
  property,
  onSuccess,
}: {
  recipe: T;
  property: keyof T;
  onSuccess?: (recipe: RecipeRecord<{ id: true; slug: true }>) => Promise<void> | void;
}) {
  const navigate = useNavigate();
  const [isEditing, setEditing] = useState(false);
  const form = useActionForm(api.recipe.update, {
    select: { id: true, [property]: true, slug: true },
    send: ["id", property as string],
    defaultValues: recipe as unknown as DeepPartial<T>,
    onSuccess: async (recipe) => {
      setEditing(false);
      await navigate(href("/r/:slug", { slug: recipe.slug }), { replace: true, viewTransition: true });
      await onSuccess?.(recipe);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  function Editable({ className, children }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
      <form onSubmit={form.submit} className={cn("group", className)}>
        {children}
      </form>
    );
  }

  function EditButton(): ReactElement {
    return (
      <Button
        className="hidden transition-colors group-hover:visible md:invisible"
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

  function SaveCancelButtons(): ReactElement {
    return (
      <>
        <SaveButton />
        <CancelButton />
      </>
    );
  }

  return {
    form,
    isEditing,
    Editable,
    EditButton,
    SaveButton,
    CancelButton,
    SaveCancelButtons,
  };
}
