"use client";

import { useState } from "react";
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

interface InputsEditorProps {
  inputs: Array<InputType>;
  onInputChange: (inputs: Array<InputType>) => void;
}

export function InputsEditor({ inputs, onInputChange }: InputsEditorProps) {
  const [selectedInputId, setSelectedInputId] = useState<string | null>(
    inputs.length > 0 ? inputs[0].id : null
  );

  const selectedInput = inputs.find((input) => input.id === selectedInputId);

  const handleAddInput = () => {
    const newInputId = `input-${crypto.randomUUID()}`;
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

  const handleInputChange = (updatedInput: InputType) => {
    onInputChange(
      inputs.map((input) =>
        input.id === updatedInput.id ? updatedInput : input
      )
    );
  };

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
                  className={`flex justify-between items-center p-3 cursor-pointer ${
                    selectedInputId === input.id ? "bg-muted" : ""
                  } hover:bg-muted/50`}
                  onClick={() => setSelectedInputId(input.id)}
                >
                  <div>
                    <p className="font-medium">{input.name}</p>
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
                  <Label htmlFor="input-name">Name</Label>
                  <Input
                    id="input-name"
                    value={selectedInput.name}
                    onChange={(e) =>
                      handleInputChange({
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
                      handleInputChange({
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
                      } else if (value === "select") {
                        newInput = {
                          ...baseInput,
                          type: "select",
                          options: [
                            {
                              id: `option-${crypto.randomUUID()}`,
                              label: "Option 1",
                            },
                            {
                              id: `option-${crypto.randomUUID()}`,
                              label: "Option 2",
                            },
                          ],
                          defaultOption: "option1",
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

                      handleInputChange(newInput);
                    }}
                  >
                    <SelectTrigger id="input-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
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
                      handleInputChange({
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
                          handleInputChange({
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
                            handleInputChange({
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
                            handleInputChange({
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
                          handleInputChange({
                            ...selectedInput,
                            placeholder: e.target.value,
                          })
                        }
                      />
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
                          handleInputChange({
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
                          handleInputChange({
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
                            handleInputChange({
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
                            handleInputChange({
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
                            handleInputChange({
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
                          handleInputChange({
                            ...selectedInput,
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {selectedInput.type === "select" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {selectedInput.options.map((option, index) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            value={option.label}
                            onChange={(e) => {
                              const newOptions = [...selectedInput.options];
                              newOptions[index] = {
                                ...newOptions[index],
                                label: e.target.value,
                              };
                              handleInputChange({
                                ...selectedInput,
                                options: newOptions,
                              });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOptions = selectedInput.options.filter(
                                (_, i) => i !== index
                              );
                              handleInputChange({
                                ...selectedInput,
                                options: newOptions,
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [
                            ...(selectedInput.options || []),
                            {
                              id: `option-${crypto.randomUUID()}`,
                              label: `Option ${(selectedInput.options?.length || 0) + 1}`,
                            },
                          ];
                          handleInputChange({
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
                        value={selectedInput.defaultOption || ""}
                        onValueChange={(value) =>
                          handleInputChange({
                            ...selectedInput,
                            defaultOption: value,
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
                          handleInputChange({
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
                            handleInputChange({
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
                            handleInputChange({
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
                            handleInputChange({
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
