import { FC, ReactNode } from 'react';

import { parseDate } from '@/core/dateUtils';

import { formatRoundCutoff } from './roundCutoff';

/**
 * A group of an expanded row's fields under a heading. Its rows go in a
 * `<PropertyList variant="summary" space={1.5}>`, whose default term width
 * lines up the values of every section. waldur-ui's Card is a bordered panel
 * of its own, which would box every group inside the row's already-shaded
 * area; this is only the heading.
 */
export const RowSection: FC<{
  title: ReactNode;
  children: ReactNode;
  'data-testid'?: string;
}> = ({ title, children, ...rest }) => (
  <section className="flex flex-col" {...rest}>
    <h6 className="text-sm font-semibold text-secondary mb-2.5">{title}</h6>
    {children}
  </section>
);

/** The classes stacking an expanded row's sections. */
export const ROW_SECTIONS_CLASS = 'flex flex-col gap-5 max-w-full';

/**
 * A round's cut-off with how long is left: "12 Nov 2026, 18:00 (in 3 days)".
 * Past cut-offs keep the date alone; a round without one is continuously open.
 */
export const RoundCutoff: FC<{
  round: { cutoff_time?: string | null } | null | undefined;
}> = ({ round }) => {
  const text = formatRoundCutoff(round);
  if (!text) return null;
  const cutoff = round?.cutoff_time ? parseDate(round.cutoff_time) : null;
  // Worded as the lists' Ending column words it, so the two never disagree.
  const upcoming = cutoff && cutoff.diffNow().as('seconds') > 0;
  return (
    <>
      {text}
      {upcoming ? (
        <span className="text-quaternary ms-1">({cutoff.toRelative()})</span>
      ) : null}
    </>
  );
};
