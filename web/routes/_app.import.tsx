import { useActionForm } from "@gadgetinc/react";
import { CloudDownloadIcon, LinkIcon, LoaderCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, href, useBlocker, useNavigate } from "react-router";
import { z } from "zod";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Field, FieldError } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { LOADING_MESSAGES } from "../lib/loading-messages";

const TYPE_SPEED_MS = 40;
const ERASE_SPEED_MS = 25;
const PAUSE_AFTER_TYPED_MS = 1500;
const PAUSE_AFTER_ERASED_MS = 300;

function useTypewriter(active: boolean): string {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<"typing" | "pausing" | "erasing" | "waiting">("typing");

  const reset = useCallback((): void => {
    indexRef.current = 0;
    charRef.current = 0;
    phaseRef.current = "typing";
    setDisplayed("");
  }, []);

  useEffect(() => {
    if (!active) {
      reset();
      return;
    }

    function tick(): void {
      const message = LOADING_MESSAGES[indexRef.current % LOADING_MESSAGES.length];
      if (message === undefined) {
        return;
      }

      switch (phaseRef.current) {
        case "typing": {
          charRef.current++;
          setDisplayed(message.slice(0, charRef.current));
          if (charRef.current >= message.length) {
            phaseRef.current = "pausing";
          }
          break;
        }
        case "pausing": {
          phaseRef.current = "erasing";
          break;
        }
        case "erasing": {
          charRef.current--;
          setDisplayed(message.slice(0, charRef.current));
          if (charRef.current <= 0) {
            phaseRef.current = "waiting";
          }
          break;
        }
        case "waiting": {
          let next: number;
          do {
            next = Math.floor(Math.random() * LOADING_MESSAGES.length);
          } while (next === indexRef.current && LOADING_MESSAGES.length > 1);
          indexRef.current = next;
          charRef.current = 0;
          phaseRef.current = "typing";
          break;
        }
      }
    }

    function scheduleNext(): number {
      switch (phaseRef.current) {
        case "typing":
          return TYPE_SPEED_MS;
        case "pausing":
          return PAUSE_AFTER_TYPED_MS;
        case "erasing":
          return ERASE_SPEED_MS;
        case "waiting":
          return PAUSE_AFTER_ERASED_MS;
      }
    }

    let timer: ReturnType<typeof setTimeout>;

    function loop(): void {
      tick();
      timer = setTimeout(loop, scheduleNext());
    }

    timer = setTimeout(loop, scheduleNext());

    return () => clearTimeout(timer);
  }, [active, reset]);

  return displayed;
}

export default function ImportRoute(): React.ReactElement {
  const navigate = useNavigate();
  const succeededRef = useRef(false);

  const { register, submit, formState, error } = useActionForm(api.import, {
    onSuccess: async (data) => {
      succeededRef.current = true;
      const { slug } = z.object({ slug: z.string() }).parse(data);
      await navigate(href("/r/:slug", { slug }), { replace: true });
    },
  });

  const blocker = useBlocker(() => formState.isSubmitting && !succeededRef.current);
  const loadingText = useTypewriter(formState.isSubmitting);

  return (
    <div className="grid h-full place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Import Recipe</CardTitle>
          <CardDescription>Paste a URL from any recipe site to import it.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={formState.isSubmitting ? (e) => e.preventDefault() : submit} className="flex flex-col gap-4">
            <Field>
              <div className="relative">
                <LinkIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input className="py-6 pl-9 text-base" required placeholder="https://..." autoFocus {...register("source")} />
              </div>
              <FieldError>{error?.message}</FieldError>
            </Field>
            <Button
              aria-disabled={formState.isSubmitting}
              size="lg"
              className={`w-full ${formState.isSubmitting ? "relative overflow-hidden" : ""}`}
            >
              {formState.isSubmitting && (
                <span className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
              {formState.isSubmitting ? <LoaderCircleIcon className="size-5 animate-spin" /> : <CloudDownloadIcon className="size-5" />}
              {formState.isSubmitting ? "Importing..." : "Import"}
            </Button>
            {formState.isSubmitting && (
              <p className="h-6 text-center text-sm">
                {loadingText}
                <span className="inline-block w-px animate-pulse">|</span>
              </p>
            )}
          </Form>
        </CardContent>
      </Card>
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>You are currently importing a recipe.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={blocker.reset}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={blocker.proceed}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
