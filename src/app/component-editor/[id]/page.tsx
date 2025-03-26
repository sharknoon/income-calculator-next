"use client";

import ComponentEditor from "@/components/component-editor";
import { useComponents } from "@/context/components-context";
import { Component } from "@/types/income";
import { useParams, useRouter } from "next/navigation";

export default function ComponentEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { components, updateComponent } = useComponents();

  const component = components.find((c) => c.id === params.id);

  if (!component) {
    return;
  }

  const handleComponentChange = (oldID: string, newComponent: Component) => {
    updateComponent(oldID, newComponent);
    if (oldID !== newComponent.id) {
      router.replace(`/component-editor/${newComponent.id}`);
    }
  };

  return (
    <ComponentEditor
      component={component}
      onComponentChange={handleComponentChange}
    />
  );
}
