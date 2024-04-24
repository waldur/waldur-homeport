import { translate } from '@waldur/i18n';
import { BaseProjectUpdateRequestsList } from '@waldur/marketplace-remote/BaseProjectUpdateRequestsList';

const filter = {
  state: 'pending',
};

export const PendingProjectUpdates = () => (
  <BaseProjectUpdateRequestsList
    filter={filter}
    title={translate('Project updates')}
    fullWidth
  />
);
