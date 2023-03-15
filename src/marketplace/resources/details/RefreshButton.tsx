import { translate } from '@waldur/i18n';

import { ActionButton } from './ActionButton';

export const RefreshButton = ({ refetch, isLoading }) => {
  return (
    <ActionButton
      title={translate('Refresh')}
      iconClass={isLoading ? 'fa-repeat fa-spin' : 'fa-repeat'}
      action={!isLoading && refetch}
    />
  );
};
