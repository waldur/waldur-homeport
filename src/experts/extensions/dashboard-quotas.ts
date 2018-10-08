import { PROJECT_DASHBOARD } from '@waldur/dashboard/constants';
import { registerQuotas } from '@waldur/dashboard/registry';
import { gettext } from '@waldur/i18n';

registerQuotas([
  {
    quota: 'nc_expert_count',
    title: gettext('Expert requests'),
    feature: 'experts',
    dashboards: [PROJECT_DASHBOARD],
  },
]);
