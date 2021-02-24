import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { cancelResource } from '@waldur/marketplace/resources/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface CancelActionProps {
  resource: Resource;
}

export const CancelAction: FunctionComponent<CancelActionProps> = ({
  resource,
}) => {
  const dispatch = useDispatch();
  // eslint-disable-next-line no-console
  console.log(resource);
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Cancel resource'),
        translate('Are you sure you want to cancel a {name}?', {
          name: resource.name.toUpperCase(),
        }),
      );
    } catch {
      return;
    }
    try {
      await cancelResource(resource.url);
      dispatch(showSuccess(translate('Resource has been cancelled.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to cancel resource.')));
    }
  };
  return <ActionItem title={translate('Cancel')} action={callback} />;
};
