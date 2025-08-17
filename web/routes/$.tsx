import { Button } from "@/components/ui/button";

export default function () {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="space-y-6">
          <h1 className="text-foreground text-6xl font-bold">404</h1>
          <h2 className="text-foreground text-3xl font-semibold">Page Not Found</h2>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
