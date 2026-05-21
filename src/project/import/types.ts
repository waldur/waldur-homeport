import { Offering } from 'waldur-js-client';

export type ImportType = 'projects_only' | 'projects_with_resources';

export interface ProjectImportFormData {
  import_type: ImportType;
  customer_uuid?: string;
  offering?: Offering | null;
  file?: File[] | null;
}
