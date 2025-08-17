import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function () {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="container max-w-4xl space-y-6 px-8 text-center">
          <h1 className="text-center text-6xl font-bold tracking-tight">👋 Hey, Developer!</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            {"This is your app's frontend. Start building it in the Gadget editor."}
          </p>
          <Button asChild>
            <a href="/edit/files/web/routes/_public._index.tsx" target="_blank">
              <Pencil />
              Edit this page
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
