import type { ReactNode } from 'react';

export type LabControlsProps = {
  children: ReactNode;
  trailing?: ReactNode;
};

export function LabControls({ children, trailing }: LabControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {trailing ? (
        <div className="ml-auto text-sm text-fd-muted-foreground">{trailing}</div>
      ) : null}
    </div>
  );
}
