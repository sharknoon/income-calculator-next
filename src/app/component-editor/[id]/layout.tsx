import type React from "react";
export default function ComponentEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container mx-auto p-6">{children}</div>;
}
