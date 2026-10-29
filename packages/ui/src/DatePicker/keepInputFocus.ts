import { createContext, useContext } from 'react';

/**
 * Set by a date picker's popup when it was opened by focusing the text
 * input. The calendar inside then leaves focus where it is, so the user can
 * keep typing with the calendar showing.
 */
export const KeepInputFocusContext = createContext(false);

export const useKeepInputFocus = () => useContext(KeepInputFocusContext);
