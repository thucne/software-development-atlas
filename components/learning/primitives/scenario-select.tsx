import { useId, type ReactNode } from 'react';

export type ScenarioOption = {
  value: string;
  label: string;
};

export type ScenarioSelectProps = {
  label: string;
  value: string;
  options: readonly ScenarioOption[];
  description: ReactNode;
  onChange: (value: string) => void;
};

export function ScenarioSelect({
  label,
  value,
  options,
  description,
  onChange,
}: ScenarioSelectProps) {
  const selectId = useId();

  return (
    <div className="grid gap-3">
      <label htmlFor={selectId} className="font-medium">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="max-w-xl rounded-md border bg-fd-background px-3 py-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="text-sm text-fd-muted-foreground">{description}</div>
    </div>
  );
}
