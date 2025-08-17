// --------------------------------------------------------------------------------------
// Public Layout (No Auth)
// --------------------------------------------------------------------------------------
// This file defines the layout for all public-facing routes that are accessible to logged out users.
// Typical pages using this layout include brochure pages, pricing, about, and other marketing or informational content.
// Structure:
//   - Navigation bar (imported from @/components/public/nav); extend this with navigation items as needed
//   - Main content area for routes (via <Outlet />)
//   - Footer that should be expanded with any content you think is relevant to your app
// To extend: update the Navigation component or replace footer content as needed.
// --------------------------------------------------------------------------------------

import { Outlet, useOutletContext } from "react-router";
import type { RootOutletContext } from "../root";

export default function () {
  const context = useOutletContext<RootOutletContext>();

  return (
    <div className="flex h-full flex-col">
      <nav className="shrink-0 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold">Recipe Book</h1>
          </div>
        </div>
      </nav>
      <main className="bg-muted/20 flex-grow">
        <Outlet context={context} />
      </main>
      <footer className="shrink-0 border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
