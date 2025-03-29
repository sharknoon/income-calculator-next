"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Input as InputType } from "@/types/income";
import { Badge } from "@/components/ui/badge";

interface InputsEditorProps {
  inputs: Array<InputType>;
  onInputChange: (inputs: Array<InputType>) => void;
}

export function InputsEditor({ inputs, onInputChange }: InputsEditorProps) {
  const [selectedInputId, setSelectedInputId] = useState<string | null>(
    inputs.length > 0 ? inputs[0].id : null,
  );

  const selectedInput = inputs.find((input) => input.id === selectedInputId);

  const handleAddInput = () => {
    const newInputId = (Math.random() + 1).toString(36).substring(7);
    const newInput: InputType = {
      id: newInputId,
      name: "New Input",
      type: "text",
      required: true,
    };

    onInputChange([...inputs, newInput]);
    setSelectedInputId(newInputId);
  };

  const handleRemoveInput = (inputId: string) => {
    onInputChange(inputs.filter((input) => input.id !== inputId));

    if (selectedInputId === inputId) {
      setSelectedInputId(inputs.length > 0 ? inputs[0].id : null);
    }
  };

  const handleInputChange = (oldID: string, updatedInput: InputType) => {
    onInputChange(
      inputs.map((input) => (input.id === oldID ? updatedInput : input)),
    );
    if (oldID !== updatedInput.id) {
      setSelectedInputId(updatedInput.id);
    }
  };

  // On period switch, make sure there is always an input selected
  useEffect(() => {
    if (
      selectedInputId &&
      !inputs.some((input) => input.id === selectedInputId)
    ) {
      setSelectedInputId(inputs[0]?.id || null);
    }
  }, [inputs, selectedInputId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Input Parameters</h3>
        <Button onClick={handleAddInput} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Input
        </Button>
      </div>

      {inputs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add inputs to collect data for your calculation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label>Available Inputs</Label>
            <div className="border rounded-md overflow-hidden">
              {inputs.map((input) => (
                <div
                  key={input.id}
                  className={`flex justify-between items-center gap-2 p-3 cursor-pointer ${
                    selectedInputId === input.id ? "bg-muted" : ""
                  } hover:bg-muted/50`}
                  onClick={() => setSelectedInputId(input.id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{input.name}</div>
                      <Badge
                        variant="outline"
                        className="inline truncate shrink"
                      >
                        {input.id}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {input.type}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveInput(input.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedInput ? (
              <div className="space-y-4 border rounded-md p-4">
                <div className="space-y-2">
                  <Label htmlFor="input-id">ID</Label>
                  <Input
                    id="input-id"
                    value={selectedInput.id}
                    onChange={(e) => {
                      let newId = e.target.value;
                      // remove invalid characters
                      newId = newId.replace(/[^a-z0-9_\$]/g, "");
                      // ensure it starts with a letter
                      newId = newId.replace(/^[^a-z_\$]/, "i");
                      handleInputChange(selectedInput.id, {
                        ...selectedInput,
                        id: newId,
                      });
                    }}
                  />
                  <Label className="text-muted-foreground text-xs">
                    Must start with a letter and only contain letters, numbers,
                    underscores, and dollar signs
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-name">Name</Label>
                  <Input
                    id="input-name"
                    value={selectedInput.name}
                    onChange={(e) =>
                      handleInputChange(selectedInput.id, {
                        ...selectedInput,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-description">Description</Label>
                  <Textarea
                    id="input-description"
                    value={selectedInput.description || ""}
                    onChange={(e) =>
                      handleInputChange(selectedInput.id, {
                        ...selectedInput,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe this input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-type">Type</Label>
                  <Select
                    value={selectedInput.type}
                    onValueChange={(value: InputType["type"]) => {
                      const baseInput = {
                        id: selectedInput.id,
                        name: selectedInput.name,
                        description: selectedInput.description,
                        required: selectedInput.required,
                      };

                      let newInput: InputType;
                      if (value === "text") {
                        newInput = {
                          ...baseInput,
                          type: "text",
                          defaultValue: "",
                          minLength: undefined,
                          maxLength: undefined,
                          validation: undefined,
                          placeholder: "",
                        };
                      } else if (value === "number") {
                        newInput = {
                          ...baseInput,
                          type: "number",
                          defaultValue: 0,
                          unit: "",
                          min: undefined,
                          max: undefined,
                          step: 1,
                          validation: undefined,
                          placeholder: "",
                        };
                      } else if (value === "boolean") {
                        newInput = {
                          ...baseInput,
                          type: "boolean",
                          defaultValue: false,
                        };
                      } else if (value === "select") {
                        newInput = {
                          ...baseInput,
                          type: "select",
                          options: [
                            {
                              id: (Math.random() + 1).toString(36).substring(7),
                              label: "Option 1",
                            },
                            {
                              id: (Math.random() + 1).toString(36).substring(7),
                              label: "Option 2",
                            },
                          ],
                          defaultValue: "option1",
                        };
                      } else {
                        newInput = {
                          ...baseInput,
                          type: "range",
                          min: 0,
                          max: 100,
                          step: 1,
                          defaultValue: 50,
                        };
                      }

                      handleInputChange(selectedInput.id, newInput);
                    }}
                  >
                    <SelectTrigger id="input-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="range">Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="input-required"
                    checked={selectedInput.required !== false}
                    onCheckedChange={(checked) =>
                      handleInputChange(selectedInput.id, {
                        ...selectedInput,
                        required: checked,
                      })
                    }
                  />
                  <Label htmlFor="input-required">Required</Label>
                </div>

                {selectedInput.type === "text" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="input-default">Default Value</Label>
                      <Input
                        id="input-default"
                        value={selectedInput.defaultValue || ""}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            defaultValue: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="input-min-length">Min Length</Label>
                        <Input
                          id="input-min-length"
                          type="number"
                          value={selectedInput.minLength || ""}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              minLength: e.target.value
                                ? Number.parseInt(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="input-max-length">Max Length</Label>
                        <Input
                          id="input-max-length"
                          type="number"
                          value={selectedInput.maxLength || ""}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              maxLength: e.target.value
                                ? Number.parseInt(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-placeholder">Placeholder</Label>
                      <Input
                        id="input-placeholder"
                        value={selectedInput.placeholder || ""}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-validation">
                        Regexp Validation
                      </Label>
                      <Input
                        id="input-validation"
                        value={selectedInput.validation?.source || ""}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            validation: new RegExp(e.target.value),
                          })
                        }
                      />
                      <Label className="text-muted-foreground text-xs">
                        Test your Regexp here:
                        <a
                          href="https://regex101.com"
                          target="_blank"
                          className="hover:underline"
                        >
                          regex101.com
                        </a>
                      </Label>
                    </div>
                  </>
                )}

                {selectedInput.type === "number" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="input-default">Default Value</Label>
                      <Input
                        id="input-default"
                        type="number"
                        value={selectedInput.defaultValue || ""}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            defaultValue: e.target.value
                              ? Number.parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-unit">Unit</Label>
                      <Input
                        id="input-unit"
                        value={selectedInput.unit || ""}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            unit: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="input-min">Min</Label>
                        <Input
                          id="input-min"
                          type="number"
                          value={selectedInput.min || ""}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              min: e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="input-max">Max</Label>
                        <Input
                          id="input-max"
                          type="number"
                          value={selectedInput.max || ""}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              max: e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="input-step">Step</Label>
                        <Input
                          id="input-step"
                          type="number"
                          value={selectedInput.step || ""}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              step: e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-placeholder">Placeholder</Label>
                      <Input
                        id="input-placeholder"
                        value={selectedInput.placeholder || ""}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-validation">
                        Regexp Validation
                      </Label>
                      <Input
                        id="input-validation"
                        value={selectedInput.validation?.source || ""}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            validation: new RegExp(e.target.value),
                          })
                        }
                      />
                      <Label className="text-muted-foreground text-xs">
                        Test your Regexp here:
                        <a
                          href="https://regex101.com"
                          target="_blank"
                          className="hover:underline"
                        >
                          regex101.com
                        </a>
                      </Label>
                    </div>
                  </>
                )}

                {selectedInput.type === "boolean" && (
                  <div className="space-y-2">
                    <Label htmlFor="input-default">Default Value</Label>
                    <Select
                      value={selectedInput.defaultValue ? "true" : "false"}
                      onValueChange={(value) =>
                        handleInputChange(selectedInput.id, {
                          ...selectedInput,
                          defaultValue: value === "true",
                        })
                      }
                    >
                      <SelectTrigger id="input-default">
                        <SelectValue placeholder="Select default value" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedInput.type === "select" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <Label className="text-muted-foreground text-xs">
                        IDs must start with a letter and only contain letters,
                        numbers, underscores, and dollar signs
                      </Label>
                      {selectedInput.options.map((option, index) => (
                        <div key={index} className="flex items-center">
                          <div className="self-stretch flex items-center justify-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                            ID
                          </div>
                          <Input
                            value={option.id}
                            onChange={(e) => {
                              const newOptions = [...selectedInput.options];
                              let newId = e.target.value;
                              // remove invalid characters
                              newId = newId.replace(/[^a-z0-9_\$]/g, "");
                              // ensure it starts with a letter
                              newId = newId.replace(/^[^a-z_\$]/, "i");
                              newOptions[index] = {
                                ...newOptions[index],
                                id: newId,
                              };
                              handleInputChange(selectedInput.id, {
                                ...selectedInput,
                                options: newOptions,
                              });
                            }}
                            className="rounded-l-none"
                          />
                          <div className="self-stretch ml-2 flex items-center justify-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                            Name
                          </div>
                          <Input
                            value={option.label}
                            onChange={(e) => {
                              const newOptions = [...selectedInput.options];
                              newOptions[index] = {
                                ...newOptions[index],
                                label: e.target.value,
                              };
                              handleInputChange(selectedInput.id, {
                                ...selectedInput,
                                options: newOptions,
                              });
                            }}
                            className="rounded-l-none"
                          />
                          {selectedInput.options.length > 1 && (
                            <Button
                              variant="ghost"
                              className="ml-2"
                              size="sm"
                              onClick={() => {
                                const newOptions = selectedInput.options.filter(
                                  (_, i) => i !== index,
                                );
                                handleInputChange(selectedInput.id, {
                                  ...selectedInput,
                                  options: newOptions,
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [
                            ...(selectedInput.options || []),
                            {
                              id: (Math.random() + 1).toString(36).substring(7),
                              label: `Option ${(selectedInput.options?.length || 0) + 1}`,
                            },
                          ];
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            options: newOptions,
                          });
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-default-option">
                        Default Option
                      </Label>
                      <Select
                        value={selectedInput.defaultValue || ""}
                        onValueChange={(value) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            defaultValue: value,
                          })
                        }
                      >
                        <SelectTrigger id="input-default-option">
                          <SelectValue placeholder="Select default option" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedInput.options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {selectedInput.type === "range" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="input-default-range">Default Value</Label>
                      <Input
                        id="input-default-range"
                        type="number"
                        value={selectedInput.defaultValue || 0}
                        onChange={(e) =>
                          handleInputChange(selectedInput.id, {
                            ...selectedInput,
                            defaultValue:
                              Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="input-min-range">Min</Label>
                        <Input
                          id="input-min-range"
                          type="number"
                          value={selectedInput.min || 0}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              min: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="input-max-range">Max</Label>
                        <Input
                          id="input-max-range"
                          type="number"
                          value={selectedInput.max || 100}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              max: Number.parseFloat(e.target.value) || 100,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="input-step-range">Step</Label>
                        <Input
                          id="input-step-range"
                          type="number"
                          value={selectedInput.step || 1}
                          onChange={(e) =>
                            handleInputChange(selectedInput.id, {
                              ...selectedInput,
                              step: Number.parseFloat(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">No Input Selected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Select an input from the list or add a new one.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
