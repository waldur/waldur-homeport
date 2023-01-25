import { translate } from '@waldur/i18n';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';

import { cancelFlow } from './api';

export const FlowCancelAction = ({ flow, refetch }) => (
  <AsyncActionButton
    title={translate('Cancel')}
    icon="fa fa-ban"
    resource={flow}
    refetch={refetch}
    apiMethod={cancelFlow}
  />
);
