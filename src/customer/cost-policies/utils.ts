import { translate } from '@waldur/i18n';

import { CostPolicyType } from './types';

export const getCostPolicyActionOptions = (type: CostPolicyType = 'project') =>
  [
    {
      value: 'block_creation_of_new_resources',
      label: translate('Block creation of new resources'),
    },
    {
      value: 'block_modification_of_existing_resources',
      label: translate('Block modification of existing resources'),
    },
    {
      value: 'notify_organization_owners',
      label: translate('Notify organization owners'),
    },
    type === 'project' && {
      value: 'notify_project_team',
      label: translate('Notify project team'),
    },
    {
      value: 'terminate_resources',
      label: translate('Schedule termination of existing resources'),
    },
  ].filter(Boolean);
