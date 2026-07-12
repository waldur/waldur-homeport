import { createContext, FC, PropsWithChildren, useContext } from 'react';

interface EditFieldContextValue {
  /** The object being edited, e.g. an offering, a resource, etc. */
  scope: Record<string, any>;
  /** The callback to persist field changes. */
  callback(formData: any): Promise<any>;
  /** Tooltip shown on a disabled edit control to explain why fields in this
   * scope are read-only (e.g. "This call is active and cannot be edited."). */
  readOnlyReason?: string;
}

const EditFieldContext = createContext<EditFieldContextValue | null>(null);

/**
 * Provides `scope` (the object being edited) and `callback` (the persist function)
 * to all descendant EditField components, eliminating prop drilling.
 *
 * @example
 * ```tsx
 * <EditFieldProvider scope={offering} callback={update}>
 *   <StringEditField name="service_attributes.backend_url" label="API URL" />
 *   <SecretEditField name="service_attributes.password" label="Password" />
 * </EditFieldProvider>
 * ```
 */
export const EditFieldProvider: FC<
  PropsWithChildren<EditFieldContextValue>
> = ({ scope, callback, readOnlyReason, children }) => (
  <EditFieldContext.Provider value={{ scope, callback, readOnlyReason }}>
    {children}
  </EditFieldContext.Provider>
);

export const useEditFieldContext = () => useContext(EditFieldContext);
