import { createContext, useContext } from 'react';

const NONE: ReadonlySet<string> = new Set();

/**
 * Component types whose quantity is decided outside the order form -- a
 * call's budget fixing the amount, say -- and so is shown, not typed. The
 * form still carries the value; the provider sets it.
 */
const ReadOnlyComponentsContext = createContext<ReadonlySet<string>>(NONE);

export const ReadOnlyComponentsProvider = ReadOnlyComponentsContext.Provider;

export const useReadOnlyComponents = () =>
  useContext(ReadOnlyComponentsContext);
