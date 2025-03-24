import { Input as InputType } from "@/types/income";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ComponentInputProps {
  input: InputType;
  value?: any;
  onChange?: (id: string, value: any) => void;
}

export function ComponentInput({ input, value, onChange }: ComponentInputProps) {
  switch (input.type) {
    case "text":
      return (
        <Input
          id={input.id}
          value={value || input.defaultValue || ""}
          onChange={(e) => onChange?.(input.id, e.target.value)}
          placeholder={input.placeholder || ""}
          minLength={input.minLength}
          maxLength={input.maxLength}
          required={input.required !== false}
          pattern={input.validation?.source}
        />
      );
    case "number":
      return (
        <div className="flex items-center space-x-2">
          <Input
            id={input.id}
            type="number"
            value={value || input.defaultValue || ""}
            onChange={(e) =>
              onChange?.(input.id, Number.parseFloat(e.target.value) || 0)
            }
            placeholder={input.placeholder || ""}
            min={input.min}
            max={input.max}
            step={input.step || 1}
            required={input.required !== false}
            className="flex-1"
            pattern={input.validation?.source}
          />
          {input.unit && (
            <span className="text-muted-foreground">{input.unit}</span>
          )}
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={input.id}
            value={value || input.defaultValue || false}
            onCheckedChange={(value) => onChange?.(input.id, value)}
            required={input.required !== false}
          />
        </div>
      );
    case "select":
      return (
        <Select
          value={value || input.defaultOption || ""}
          onValueChange={(value) => onChange?.(input.id, value)}
          required={input.required !== false}
        >
          <SelectTrigger id={input.id}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {input.options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "range":
      return (
        <div className="space-y-2">
          <Slider
            id={input.id}
            min={input.min}
            max={input.max}
            step={input.step}
            value={value || input.defaultValue}
            onValueChange={(values) => onChange?.(input.id, values[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{input.min}</span>
            <span>{value || input.defaultValue}</span>
            <span>{input.max}</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}
