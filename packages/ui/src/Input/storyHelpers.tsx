import { Fragment, ReactNode } from 'react';

/** A labelled row of the state grid: the control, outlined then solid. */
export type StateRow = [label: string, render: (solid: boolean) => ReactNode];

/**
 * The grid every text control's States story uses, so they read the same:
 * one row per state, the outlined control beside the solid one. Hover and
 * focus are live (point at a field, tab into it, or use the pseudo-state
 * toolbar).
 */
export const StateGrid = ({ rows }: { rows: StateRow[] }) => (
  <div className="grid max-w-[720px] grid-cols-[120px_1fr_1fr] items-center gap-3 p-5">
    <span />
    <span className="text-sm text-tertiary">Outlined</span>
    <span className="text-sm text-tertiary">Solid</span>
    {rows.map(([label, render]) => (
      <Fragment key={label}>
        <span className="text-sm text-secondary">{label}</span>
        {render(false)}
        {render(true)}
      </Fragment>
    ))}
  </div>
);
