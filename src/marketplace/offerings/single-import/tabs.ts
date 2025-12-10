import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';

import { FileUploadTab } from './FileUploadTab';
import { ImportConfigurationTab } from './ImportConfigurationTab';
import { ReviewImportTab } from './ReviewImportTab';

export const SINGLE_OFFERING_IMPORT_STEPS: ProgressStep[] = [
  {
    key: 'FileUpload',
    label: translate('Upload offering file'),
    completed: false,
  },
  {
    key: 'Configuration',
    label: translate('Configure import'),
    completed: false,
  },
  {
    key: 'Review',
    label: translate('Review and confirm'),
    completed: false,
  },
];

export const SINGLE_OFFERING_IMPORT_TABS = {
  FileUpload: FileUploadTab,
  Configuration: ImportConfigurationTab,
  Review: ReviewImportTab,
};
