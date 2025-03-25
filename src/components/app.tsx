import React, { useEffect } from "react";

import Editor, { useMonaco } from "@monaco-editor/react";

export function App() {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      // Add additonal d.ts files to the JavaScript language service and change.
      // Also change the default compilation options.
      // The sample below shows how a class Facts is declared and introduced
      // to the system and how the compiler is told to use ES6 (target=2).

      // validation settings
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });

      // compiler options
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
      });

      // extra libraries
      const libSource = [
        "declare class Facts {",
        "    /**",
        "     * Returns the next fact",
        "     */",
        "    static next():string",
        "}",
      ].join("\n");

      const libUri = "ts:filename/facts.d.ts";
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        libSource,
        libUri,
      );
      // When resolving definitions and references, the editor will try to use created models.
      // Creating a model for the library allows "peek definition/references" commands to work with the library.
      monaco.editor.createModel(
        libSource,
        "typescript",
        monaco.Uri.parse(libUri),
      );
    }
  }, [monaco]);

  return (
    <Editor
      height="90vh"
      defaultLanguage="typescript"
      defaultValue="// try to use Facts class"
    />
  );
}
