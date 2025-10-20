import { ChefHatIcon, ListIcon, LockIcon, LockOpenIcon, ScaleIcon } from "lucide-react";
import ms from "ms";
import { useEffect, useState, type ReactElement } from "react";
import { Markdown } from "../components/markdown";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { cn } from "../lib/utils";
import { RecipeMenu } from "./_app._index";
import { useRecipe } from "./_app.r.$slug";

export default function RecipeIndexRoute() {
  const { recipe } = useRecipe();

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
    <div className="@container">
      <div className="flex flex-col gap-4 @sm:gap-8">
        <Carousel>
          <CarouselPrevious />
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id}>
                <img
                  className="mx-auto aspect-square object-contain"
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
          <CarouselNext />
        </Carousel>
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className={cn("line-clamp-none leading-tight font-semibold @xs:text-xl @sm:text-2xl")}>{recipe.name}</span>
            <RecipeMenu recipe={recipe} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm @xs:text-base @sm:text-lg">
              <span className="font-medium">Serves:</span> <span className="font-extralight">{recipe.servingSize}</span>
              <span className="inline @lg:hidden">
                <span className="ml-2 font-medium">Prep:</span> <span className="font-extralight">{ms(recipe.prepTime)}</span>
                <span className="ml-2 font-medium">Cook:</span> <span className="font-extralight">{ms(recipe.cookTime)}</span>
              </span>
              <span className="hidden @lg:inline">
                <span className="ml-2 font-medium">Prep:</span>{" "}
                <span className="font-extralight">{ms(recipe.prepTime, { long: true })}</span>
                <span className="ml-2 font-medium">Cook:</span>{" "}
                <span className="font-extralight">{ms(recipe.cookTime, { long: true })}</span>
              </span>
            </div>
            <RecipeWakeLock />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListIcon className="h-6 w-6" />
                <h2 className="font-bold @xs:text-xl @sm:text-2xl">Ingredients</h2>
              </div>
            </div>
            <Markdown>
              {typeof recipe.ingredients === "string" ? recipe.ingredients : (recipe.ingredients as string[]).join("\n- ")}
            </Markdown>
          </div>
          {/* Directions */}
          <div>
            <div className="flex items-center gap-2">
              <ChefHatIcon className="h-6 w-6" />
              <h2 className="font-bold @xs:text-xl @sm:text-2xl">Directions</h2>
            </div>
            <Markdown>{typeof recipe.directions === "string" ? recipe.directions : (recipe.directions as string[]).join("\n- ")}</Markdown>
          </div>
          {/* Nutrition */}
          {recipe.nutrition && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <ScaleIcon className="h-6 w-6" />
                <h2 className="font-bold @xs:text-xl @sm:text-2xl">Nutrition</h2>
              </div>
              <Markdown>{typeof recipe.nutrition === "string" ? recipe.nutrition : (recipe.nutrition as string[]).join("\n- ")}</Markdown>
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
        {wakeLock ? <LockIcon className="h-4 w-4" /> : <LockOpenIcon className="h-4 w-4" />}
        <span className="hidden text-nowrap @md:inline">Cook Mode</span>
        <Switch id="cook-mode" checked={wakeLock} onCheckedChange={setWakeLock} />
      </Label>
    </div>
  );
}
