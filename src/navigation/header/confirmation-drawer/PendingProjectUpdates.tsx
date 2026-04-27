import { translate } from '@/i18n';
import { BaseProjectUpdateRequestsList } from '@/marketplace-remote/BaseProjectUpdateRequestsList';

const filter = {
  state: 'pending',
};

export const PendingProjectUpdates = () => (
  <BaseProjectUpdateRequestsList
    filter={filter}
    title={translate('Project updates')}
  />
);
