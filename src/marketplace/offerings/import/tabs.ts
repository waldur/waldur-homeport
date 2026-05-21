import { translate } from '@/i18n';
import { ProgressStep } from '@/wizard';

import { CredentialsTab } from './CredentialsTab';
import { ImportReviewTab } from './ImportReviewTab';
import { SelectCategoryTab } from './SelectCategoryTab';
import { SelectOfferingTab } from './SelectOfferingTab';
import { SelectOrganizationTab } from './SelectOrganizationTab';

export const OFFERING_IMPORT_STEPS: ProgressStep[] = [
  {
    key: 'Credentials',
    label: translate('Connect to remote waldur'),
    completed: false,
  },
  {
    key: 'Organization',
    label: translate('Select organization'),
    completed: false,
  },
  {
    key: 'Offering',
    label: translate('Choose offerings'),
    completed: false,
  },
  {
    key: 'Category',
    label: translate('Map categories'),
    completed: false,
  },
  {
    key: 'Review',
    label: translate('Review and confirm'),
    completed: false,
  },
];

export const OFFERING_IMPORT_TABS = {
  Credentials: CredentialsTab,
  Organization: SelectOrganizationTab,
  Offering: SelectOfferingTab,
  Category: SelectCategoryTab,
  Review: ImportReviewTab,
};
