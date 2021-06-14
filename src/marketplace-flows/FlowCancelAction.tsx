import { translate } from '@waldur/i18n';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';

import { cancelFlow } from './api';

export const FlowCancelAction = ({ flow, refreshList }) => (
  <AsyncActionButton
    title={translate('Cancel')}
    icon="fa fa-ban"
    resource={flow}
    refreshList={refreshList}
    apiMethod={cancelFlow}
  />
);
