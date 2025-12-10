import { OfferingImportParametersRequest } from 'waldur-js-client';

export type SingleOfferingImportFormData = Omit<
  OfferingImportParametersRequest,
  'category'
> & {
  importFile?: File;
  _category_name?: string; // to hold category name before it's converted to category object
  category?: {
    uuid?: string;
    value?: string;
    label?: string;
    name?: string;
    title?: string;
  };
};
