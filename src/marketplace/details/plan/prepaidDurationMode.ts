import { createContext, useContext } from 'react';

/**
 * Asks the selector for whole months rather than an end date: a proposal is
 * written before allocation, so only the length can be decided.
 */
export interface PrepaidMonthsMode {
  /** Form field holding the duration, in whole months. */
  name: string;
  /** Caps the options, as `project.end_date` does in the checkout. */
  maxEndDate?: string;
  /** The cap in whole months as the backend states it; the tooltip names it. */
  maxMonths?: number | null;
}

const PrepaidMonthsModeContext = createContext<PrepaidMonthsMode | null>(null);

export const PrepaidMonthsModeProvider = PrepaidMonthsModeContext.Provider;

export const usePrepaidMonthsMode = () => useContext(PrepaidMonthsModeContext);
