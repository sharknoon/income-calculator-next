import { Input as InputType, InputValue } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ComponentInputProps {
  input: InputType;
  value?: InputValue;
  onChange?: (value: InputValue) => void;
}

export function ComponentInput({
  input,
  value,
  onChange,
}: ComponentInputProps) {
  switch (input.type) {
    case "text":
      return (
        <Input
          id={input.id}
          value={typeof value === "string" ? value : (input.defaultValue ?? "")}
          onChange={(e) => onChange?.(e.target.value)}
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
            value={
              typeof value === "number"
                ? value
                : (input.defaultValue ?? input.min ?? 0)
            }
            onChange={(e) => onChange?.(Number.parseFloat(e.target.value) || 0)}
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
            checked={
              typeof value === "boolean" ? value : (input.defaultValue ?? false)
            }
            onCheckedChange={(value) => onChange?.(value)}
            required={input.required !== false}
          />
        </div>
      );
    case "select":
      return (
        <Select
          value={
            typeof value === "string"
              ? value
              : (input.defaultValue ?? input.options[0]?.id)
          }
          onValueChange={(value) => onChange?.(value)}
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
            value={
              typeof value === "number"
                ? [value]
                : [input.defaultValue ?? input.min ?? 0]
            }
            onValueChange={(values) => onChange?.(values[0])}
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
