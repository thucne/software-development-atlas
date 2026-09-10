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
  compact?: boolean;
};

export function ScenarioSelect({
  label,
  value,
  options,
  description,
  onChange,
  compact = false,
}: ScenarioSelectProps) {
  const selectId = useId();

  return (
    <div className={`min-w-0 ${compact ? 'grid gap-1.5' : 'grid gap-3'}`}>
      <label
        htmlFor={selectId}
        className={compact ? 'text-sm font-medium' : 'font-medium'}
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={[
          'box-border w-full min-w-0 max-w-full rounded-md border bg-fd-background',
          compact ? 'px-2.5 py-1.5 text-sm' : 'px-3 py-2',
        ].join(' ')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div
        className={[
          'min-w-0 max-w-full break-words text-fd-muted-foreground',
          compact ? 'text-xs leading-relaxed' : 'text-sm',
        ].join(' ')}
      >
        {description}
      </div>
    </div>
  );
}
