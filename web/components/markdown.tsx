import { lazy, Suspense } from "react";

const ReactMarkdown = lazy(() => import("react-markdown"));

export const Markdown = ({ children }: { children: string }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactMarkdown className="prose">{children}</ReactMarkdown>
    </Suspense>
  );
};
