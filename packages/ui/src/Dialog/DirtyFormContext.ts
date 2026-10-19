import { createContext } from 'react';

/**
 * Lets a form inside a dialog tell ModalRoot it holds unsaved input, so
 * closing the dialog asks first. A form library's own hook sets it (the
 * app's useDirtyForm, for react-final-form).
 */
export const DirtyFormContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsDirty: (_: boolean) => {},
});
