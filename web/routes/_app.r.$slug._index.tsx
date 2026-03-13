import { ChefHatIcon, Clock, ListIcon, LockIcon, LockOpenIcon, ScaleIcon, Users } from "lucide-react";
import ms from "ms";
import { type ReactElement, useEffect, useState } from "react";

import { Markdown } from "../components/markdown";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { Switch } from "../components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { cn } from "../lib/utils";
import { RecipeMenu } from "./_app._index";
import { type Recipe, useRecipe } from "./_app.r.$slug";

export default function RecipeIndexRoute() {
  const { recipe } = useRecipe();
  const [cookMode, setCookMode] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  let images = recipe.images.edges.map((image) => image.node).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  if (!images.length) {
    images = [
      {
        alt: "Placeholder",
        file: { mimeType: "image/svg+xml", url: "/placeholder.svg" },
        height: 500,
        id: "placeholder",
        index: 0,
        src: "/placeholder.svg",
        userId: null,
        width: 500,
      },
    ];
  }

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setCount(carouselApi.scrollSnapList().length);
      setCurrent(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <TooltipProvider>
      <div className="@container">
        <div className="flex flex-col gap-4 @sm:gap-6">
          {/* Enhanced Image Carousel */}
          <div className="relative">
            <Carousel setApi={setCarouselApi} className="w-full">
              <CarouselContent>
                {images.map((image) => (
                  <CarouselItem key={image.id}>
                    <RecipeImage image={image} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {count > 1 && (
                <>
                  <CarouselPrevious variant="ghost" className="absolute top-1/2 left-4 -translate-y-1/2" />
                  <CarouselNext variant="ghost" className="absolute top-1/2 right-4 -translate-y-1/2" />
                </>
              )}
            </Carousel>
            {/* Pagination Dots */}
            {count > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      current === index ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2",
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recipe Header */}
          <div className="pb-2">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold @sm:text-3xl">{recipe.name}</h1>
              <RecipeMenu recipe={recipe} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-6 text-sm @sm:text-base">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-5 w-5" />
                  <span className="font-medium">Serves:</span>
                  <span className="text-muted-foreground">{recipe.servingSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-5 w-5" />
                  <span className="font-medium">Total:</span>
                  <span className="text-muted-foreground hidden @lg:inline">{ms(totalTime, { long: true })}</span>
                  <span className="text-muted-foreground @lg:hidden">{ms(totalTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Prep:</span>
                  <span className="text-muted-foreground hidden @lg:inline">{ms(recipe.prepTime, { long: true })}</span>
                  <span className="text-muted-foreground @lg:hidden">{ms(recipe.prepTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Cook:</span>
                  <span className="text-muted-foreground hidden @lg:inline">{ms(recipe.cookTime, { long: true })}</span>
                  <span className="text-muted-foreground @lg:hidden">{ms(recipe.cookTime)}</span>
                </div>
              </div>
              <RecipeWakeLock cookMode={cookMode} setCookMode={setCookMode} />
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 gap-6 @lg:grid-cols-[2fr_3fr]">
            {/* Ingredients */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 pb-3 text-xl font-bold">
                <ListIcon className="h-5 w-5" />
                Ingredients
              </h2>
              <IngredientsSection recipe={recipe} cookMode={cookMode} />
            </div>

            {/* Directions */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 pb-3 text-xl font-bold">
                <ChefHatIcon className="h-5 w-5" />
                Directions
              </h2>
              <Markdown>
                {typeof recipe.directions === "string" ? recipe.directions : (recipe.directions as string[]).join("\n- ")}
              </Markdown>
            </div>
          </div>

          {/* Nutrition */}
          {recipe.nutrition && (
            <div className="pt-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <ScaleIcon className="h-5 w-5" />
                Nutrition
              </h2>
              <Markdown>{typeof recipe.nutrition === "string" ? recipe.nutrition : (recipe.nutrition as string[]).join("\n- ")}</Markdown>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function IngredientsSection({ recipe, cookMode }: { recipe: Recipe; cookMode: boolean }): ReactElement {
  const ingredientsText = typeof recipe.ingredients === "string" ? recipe.ingredients : (recipe.ingredients as string[]).join("\n- ");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Parse ingredients into list items
  const ingredientsList = ingredientsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== "-")
    .map((line) => line.replace(/^[-*]\s*/, ""));

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!cookMode) {
    return <Markdown>{ingredientsText}</Markdown>;
  }

  return (
    <ul className="space-y-3">
      {ingredientsList.map((ingredient, index) => (
        <li key={index} className="flex items-start gap-3">
          <input
            type="checkbox"
            id={`ingredient-${index}`}
            checked={checkedItems.has(index)}
            onChange={() => toggleItem(index)}
            className="text-primary focus:ring-primary mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-offset-0"
          />
          <label
            htmlFor={`ingredient-${index}`}
            className={cn(
              "flex-1 cursor-pointer transition-all select-none",
              checkedItems.has(index) && "text-muted-foreground line-through",
            )}
          >
            {ingredient}
          </label>
        </li>
      ))}
    </ul>
  );
}

function RecipeImage({ image }: { image: { id: string; file: { url: string }; alt: string | null } }): ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative flex h-64 w-full items-center justify-center @sm:h-80">
        {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
        {!hasError && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div className="group relative">
              <img
                className={cn(
                  "max-h-64 cursor-pointer object-contain transition-opacity duration-300 @sm:max-h-80",
                  isLoading && "opacity-0",
                )}
                src={image.file.url}
                alt={image.alt ?? "Recipe image"}
                loading="lazy"
                decoding="async"
                onClick={() => !isLoading && setIsOpen(true)}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
              {!isLoading && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20"
                  style={{ pointerEvents: "none" }}
                >
                  <span className="text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Click to enlarge
                  </span>
                </div>
              )}
            </div>
            <DialogContent className="max-w-[95vw] p-0 sm:max-w-[90vw]">
              <div className="relative flex max-h-[90vh] items-center justify-center p-4">
                <img
                  className="max-h-[85vh] w-auto max-w-full object-contain"
                  src={image.file.url}
                  alt={image.alt ?? "Recipe image"}
                  loading="eager"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
        {hasError && (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
            <span>Failed to load image</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeWakeLock({ cookMode, setCookMode }: { cookMode: boolean; setCookMode: (value: boolean) => void }): ReactElement {
  useEffect(() => {
    if (!cookMode) {
      return;
    }

    // oxlint-disable-next-line typescript/no-invalid-void-type
    let wakeLockPromise: Promise<WakeLockSentinel | void> | undefined;
    if ("wakeLock" in navigator) {
      wakeLockPromise = navigator.wakeLock.request("screen").catch((error: unknown) => console.error(error));
    }
    return () => {
      wakeLockPromise?.then((wakeLock) => wakeLock?.release()).catch((error: unknown) => console.error(error));
    };
  }, [cookMode]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          {cookMode ? <LockIcon className="text-muted-foreground h-5 w-5" /> : <LockOpenIcon className="text-muted-foreground h-5 w-5" />}
          <Label htmlFor="cook-mode" className="cursor-pointer font-medium">
            Cook Mode
          </Label>
          <Switch id="cook-mode" checked={cookMode} onCheckedChange={setCookMode} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Keep screen awake and enable interactive ingredients</p>
      </TooltipContent>
    </Tooltip>
  );
}
