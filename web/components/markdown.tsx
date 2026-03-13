import { Suspense, lazy } from "react";

const ReactMarkdown = lazy(() => import("react-markdown"));

export const Markdown = ({ children }: { children: string }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ReactMarkdown className="prose">{children}</ReactMarkdown>
  </Suspense>
);
