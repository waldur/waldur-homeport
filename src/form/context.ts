import { createContext } from 'react';

type FormFieldsContext = {
  readOnlyFields?: Array<string>;
};

export const FormFieldsContext = createContext<FormFieldsContext>({
  readOnlyFields: [],
});
