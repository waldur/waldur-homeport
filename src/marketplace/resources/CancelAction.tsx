import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { cancelResource } from '@waldur/marketplace/resources/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
// import {waitForConfirmation} from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

// import {cancelResource} from '@waldur/marketplace/resources/api';

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
    /* try {
      await waitForConfirmation(
        dispatch,
        translate('Destroy resource'),
        getConfirmationText(resource) + (dialogSubtitle || ''),
      );
    } catch {
      return;
    }*/

    try {
      await cancelResource(resource.url);
      dispatch(showSuccess(translate('Resource deletion has been scheduled.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete resource.')));
    }
  };
  return (
    <ActionItem
      title={translate('Cancel')}
      action={callback}
      // className="remove"
    />
  );
};
