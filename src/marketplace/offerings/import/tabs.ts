import { translate } from '@waldur/i18n';

import { CredentialsTab } from './CredentialsTab';
import { SelectCategoryTab } from './SelectCategoryTab';
import { SelectOfferingTab } from './SelectOfferingTab';
import { SelectOrganizationTab } from './SelectOrganizationTab';

export const OFFERING_IMPORT_STEPS = [
  'Credentials',
  'Organization',
  'Offering',
  'Category',
];

export const OFFERING_IMPORT_TABS = {
  Credentials: CredentialsTab,
  Organization: SelectOrganizationTab,
  Offering: SelectOfferingTab,
  Category: SelectCategoryTab,
};

export const getTabLabel = (tab: string) =>
  ({
    Credentials: translate('Credentials'),
    Organization: translate('Organization'),
    Offering: translate('Offering'),
    Category: translate('Category'),
  }[tab] || tab);
