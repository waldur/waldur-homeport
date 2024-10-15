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
    {
      value: 'request_downscaling',
      label: translate('Request downscaling of resources'),
    },
    {
      value: 'request_pausing',
      label: translate('Request pausing of resources'),
    },
    {
      value: 'restrict_members',
      label: translate(
        'Request restriction of project member access to resources',
      ),
    },
  ].filter(Boolean);

export const policyPeriodOptions = {
  total: { value: 1, label: translate('Total') },
  oneMonth: { value: 2, label: translate('{count} month', { count: 1 }) },
  threeMonth: { value: 3, label: translate('{count} month', { count: 3 }) },
  twelveMonth: { value: 4, label: translate('{count} month', { count: 12 }) },
};
