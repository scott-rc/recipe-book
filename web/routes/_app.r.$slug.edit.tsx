import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "@gadgetinc/react";
import { ClockIcon, GripVerticalIcon, ImageIcon, ImagePlusIcon, InfoIcon, LoaderCircleIcon, TrashIcon, UtensilsIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router";
import { toast } from "sonner";

import { api } from "../api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { formatTimeForInput, getTimePreview, parseTimeString } from "../lib/time-utils";
import { type ImageItem, useImageManager } from "../lib/use-image-manager";
import { cn } from "../lib/utils";
import { useRecipe } from "./_app.r.$slug";

// Components
function SortableImageItem({ image, onDelete, disabled }: { image: ImageItem; onDelete: (id: string) => void; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ disabled, id: image.id });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-muted hover:ring-primary/20 relative aspect-video overflow-hidden rounded-lg border transition-all hover:scale-[1.02] hover:ring-2",
        isDragging && "ring-primary scale-95 ring-2",
      )}
    >
      <img src={image.file.url} alt={image.alt ?? "Recipe image"} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={disabled}
            className="bg-background/90 cursor-grab rounded p-2 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Drag to reorder image"
          >
            <GripVerticalIcon className="text-muted-foreground size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            disabled={disabled}
            className="bg-destructive/90 text-destructive-foreground hover:bg-destructive rounded p-2 disabled:opacity-50"
            aria-label={`Delete image: ${image.alt ?? "Recipe image"}`}
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function EditRecipeRoute() {
  const { recipe } = useRecipe();

  // Initialize form with properly formatted time values
  const form = useForm({
    defaultValues: {
      cookTime: formatTimeForInput(recipe.cookTime),
      directions: typeof recipe.directions === "string" ? recipe.directions : "",
      ingredients: typeof recipe.ingredients === "string" ? recipe.ingredients : "",
      name: recipe.name,
      nutrition: recipe.nutrition ?? "",
      prepTime: formatTimeForInput(recipe.prepTime),
      servingSize: recipe.servingSize,
      source: recipe.source ?? "",
    },
  });

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Image management - store initial images as JSON for simple comparison
  const initialImages = useMemo(() => recipe.images.edges.map((edge) => edge.node), [recipe.images.edges]);
  const initialImagesJson = useRef(JSON.stringify(initialImages.map((i) => i.id)));
  const { images, fileInputRef, handleFileSelect, handleDelete, reorderImages } = useImageManager(initialImages);

  // Detect if images have changed (additions, deletions, or reordering)
  const currentImagesJson = JSON.stringify(images.map((i) => i.id));
  const hasImageChanges = currentImagesJson !== initialImagesJson.current;

  // Track if form has unsaved changes
  const hasUnsavedChanges = form.formState.isDirty || hasImageChanges || isSubmitting;
  const blocker = useBlocker(hasUnsavedChanges);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Drag handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderImages(active.id as string, over.id as string);
    }
  };

  // Form Submission
  const onSubmit = form.handleSubmit(async (data) => {
    // Parse time strings to milliseconds
    const prepTimeMs = parseTimeString(data.prepTime);
    const cookTimeMs = parseTimeString(data.cookTime);

    setIsSubmitting(true);
    try {
      await api.recipe.update(recipe.id, {
        cookTime: cookTimeMs,
        directions: data.directions,
        images: [
          {
            _converge: {
              values: images.map((image) =>
                image.uploadFile
                  ? {
                      file: { file: image.uploadFile },
                      index: image.index,
                    }
                  : {
                      id: image.id,
                      index: image.index,
                    },
              ),
            },
          },
        ],
        ingredients: data.ingredients,
        name: data.name,
        nutrition: data.nutrition,
        prepTime: prepTimeMs,
        servingSize: data.servingSize,
        source: data.source,
      });

      // Reset form with the current values to mark as not dirty
      form.reset(data);

      // Update initial images to current state
      initialImagesJson.current = currentImagesJson;

      toast.success("Recipe updated successfully");
    } catch (error) {
      toast.error((error as Error).message, { dismissible: true });
    } finally {
      setIsSubmitting(false);
    }
  });

  // Get current time values for preview
  const prepTimeValue = form.watch("prepTime");
  const cookTimeValue = form.watch("cookTime");
  const prepTimePreview = getTimePreview(prepTimeValue);
  const cookTimePreview = getTimePreview(cookTimeValue);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges && !isSubmitting) {
          const formElement = document.getElementById("recipe-form");
          if (formElement instanceof HTMLFormElement) {
            formElement.requestSubmit();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, isSubmitting]);

  // Scroll detection for sticky header
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsScrolled(!entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    const currentHeader = headerRef.current;
    if (currentHeader) {
      observer.observe(currentHeader);
    }

    return () => observer.disconnect();
  }, []);

  // Render
  return (
    <>
      <div className="flex flex-col gap-y-8 pb-24 sm:pb-20">
        {/* Sticky Header - Full Width */}
        {isScrolled && (
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed top-0 right-0 left-0 z-40 border-b shadow-sm backdrop-blur">
            <div className="mx-auto w-full max-w-md px-4 py-3 sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate font-semibold">{recipe.name}</h2>
                {hasUnsavedChanges && (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    Unsaved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          {/* Page Header */}
          <div ref={headerRef} className="mb-8 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Edit Recipe</h1>
              {hasUnsavedChanges && (
                <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Unsaved
                </span>
              )}
            </div>
            <p className="text-muted-foreground">Make changes to your recipe below</p>
          </div>

          {/* Form */}
          <form id="recipe-form" onSubmit={onSubmit}>
            <div className="space-y-8 sm:space-y-10">
              {/* Images Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3">
                  <ImageIcon className="text-primary size-5" />
                  <h3 className="text-lg font-semibold">Images</h3>
                  {images.length > 0 && <span className="text-muted-foreground text-sm font-normal">({images.length})</span>}
                </div>
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldDescription>Upload images for your recipe. Drag to reorder.</FieldDescription>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                        disabled={isSubmitting}
                        aria-label="Upload recipe images"
                      />
                      <div className="flex flex-col gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto"
                          aria-label="Add images to recipe"
                        >
                          <ImagePlusIcon className="mr-2 size-4" aria-hidden="true" />
                          Add Images
                        </Button>
                        {images.length > 0 && (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
                              <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {images.map((image) => (
                                  <SortableImageItem key={image.id} image={image} onDelete={handleDelete} disabled={isSubmitting} />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}
                      </div>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3">
                  <InfoIcon className="text-primary size-5" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                <FieldSet>
                  <FieldGroup>
                    <Field data-invalid={form.control.getFieldState("name").invalid}>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input {...form.register("name")} id="name" autoComplete="off" disabled={isSubmitting} aria-required="true" />
                      <FieldError errors={[form.formState.errors.name]} />
                    </Field>

                    <Field data-invalid={form.control.getFieldState("servingSize").invalid}>
                      <FieldLabel htmlFor="servingSize">Serving Size</FieldLabel>
                      <FieldDescription>Number of servings this recipe makes</FieldDescription>
                      <Input
                        {...form.register("servingSize")}
                        id="servingSize"
                        type="number"
                        inputMode="numeric"
                        required
                        disabled={isSubmitting}
                        aria-required="true"
                      />
                      <FieldError errors={[form.formState.errors.servingSize]} />
                    </Field>

                    <Field data-invalid={form.control.getFieldState("source").invalid}>
                      <FieldLabel htmlFor="source">Source</FieldLabel>
                      <FieldDescription>URL or name of the recipe source (optional)</FieldDescription>
                      <Input {...form.register("source")} id="source" type="url" disabled={isSubmitting} />
                      <FieldError errors={[form.formState.errors.source]} />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>

              {/* Timing Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3">
                  <ClockIcon className="text-primary size-5" />
                  <h3 className="text-lg font-semibold">Timing</h3>
                </div>
                <FieldSet>
                  <FieldGroup>
                    <Field data-invalid={form.control.getFieldState("prepTime").invalid}>
                      <FieldLabel htmlFor="prepTime">Prep Time</FieldLabel>
                      <FieldDescription>
                        Time required to prepare (e.g., &quot;5m&quot;, &quot;1 hour 30 minutes&quot;, &quot;45 seconds&quot;)
                      </FieldDescription>
                      <Input
                        {...form.register("prepTime", {
                          required: "Prep time is required",
                          validate: (value) => {
                            if (!value.trim()) {
                              return "Prep time is required";
                            }
                            const parsed = parseTimeString(value);
                            if (parsed === undefined) {
                              return "Invalid format. Use formats like '5m', '1h 30m', '45s', etc.";
                            }
                            return true;
                          },
                        })}
                        id="prepTime"
                        placeholder="e.g., 5m, 1h 30m, 45s"
                        disabled={isSubmitting}
                        aria-required="true"
                      />
                      {prepTimePreview && !form.formState.errors.prepTime && (
                        <p className="text-muted-foreground text-sm">{prepTimePreview}</p>
                      )}
                      <FieldError errors={[form.formState.errors.prepTime]} />
                    </Field>

                    <Field data-invalid={form.control.getFieldState("cookTime").invalid}>
                      <FieldLabel htmlFor="cookTime">Cook Time</FieldLabel>
                      <FieldDescription>
                        Time required to cook (e.g., &quot;5m&quot;, &quot;1 hour 30 minutes&quot;, &quot;45 seconds&quot;)
                      </FieldDescription>
                      <Input
                        {...form.register("cookTime", {
                          required: "Cook time is required",
                          validate: (value) => {
                            if (!value.trim()) {
                              return "Cook time is required";
                            }
                            const parsed = parseTimeString(value);
                            if (parsed === undefined) {
                              return "Invalid format. Use formats like '5m', '1h 30m', '45s', etc.";
                            }
                            return true;
                          },
                        })}
                        id="cookTime"
                        placeholder="e.g., 5m, 1h 30m, 45s"
                        disabled={isSubmitting}
                        aria-required="true"
                      />
                      {cookTimePreview && !form.formState.errors.cookTime && (
                        <p className="text-muted-foreground text-sm">{cookTimePreview}</p>
                      )}
                      <FieldError errors={[form.formState.errors.cookTime]} />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>

              {/* Content Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3">
                  <UtensilsIcon className="text-primary size-5" />
                  <h3 className="text-lg font-semibold">Recipe Content</h3>
                </div>
                <FieldSet>
                  <FieldGroup>
                    <Field data-invalid={form.control.getFieldState("ingredients").invalid}>
                      <FieldLabel htmlFor="ingredients">Ingredients</FieldLabel>
                      <FieldDescription>List of ingredients (supports Markdown formatting)</FieldDescription>
                      <Textarea
                        {...form.register("ingredients")}
                        id="ingredients"
                        required
                        disabled={isSubmitting}
                        rows={8}
                        aria-required="true"
                      />
                      <FieldError errors={[form.formState.errors.ingredients]} />
                    </Field>

                    <Field data-invalid={form.control.getFieldState("directions").invalid}>
                      <FieldLabel htmlFor="directions">Directions</FieldLabel>
                      <FieldDescription>Step-by-step instructions (supports Markdown formatting)</FieldDescription>
                      <Textarea
                        {...form.register("directions")}
                        id="directions"
                        required
                        disabled={isSubmitting}
                        rows={10}
                        aria-required="true"
                      />
                      <FieldError errors={[form.formState.errors.directions]} />
                    </Field>

                    <Field data-invalid={form.control.getFieldState("nutrition").invalid}>
                      <FieldLabel htmlFor="nutrition">Nutrition</FieldLabel>
                      <FieldDescription>Nutritional information per serving (optional, supports Markdown formatting)</FieldDescription>
                      <Textarea {...form.register("nutrition")} id="nutrition" disabled={isSubmitting} rows={6} />
                      <FieldError errors={[form.formState.errors.nutrition]} />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Action Bar */}
      {hasUnsavedChanges && (
        <div className="animate-in slide-in-from-bottom-5 bg-background/95 supports-[backdrop-filter]:bg-background/80 safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur">
          <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <div className="size-2 animate-pulse rounded-full bg-amber-500" />
              <span className="font-medium">Unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  initialImagesJson.current = JSON.stringify(initialImages.map((i) => i.id));
                }}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Discard
              </Button>
              <Button type="submit" form="recipe-form" disabled={isSubmitting} className="flex-1 sm:flex-none">
                {isSubmitting ? (
                  <>
                    <LoaderCircleIcon className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Are you sure you want to leave?</AlertDialogDescription>
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
