import { AttachmentUploading } from '@/form/upload/types';

import { PersonIdentifierFieldConfig } from './PersonIdentifierFieldsRenderer';

export interface OrganizationCreateFormValues {
  validationMethod?: string;
  personIdentifierFieldConfig?: PersonIdentifierFieldConfig | null;
  uploadedFiles?: AttachmentUploading[];
  registration_code?: string;
  name?: string;
  [key: string]: any;
}
