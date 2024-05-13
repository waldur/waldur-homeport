import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ENDPOINT_FORM_ID } from './constants';

const AddEndpointDialog = lazyComponent(
  () => import('./AddEndpointDialog'),
  'AddEndpointDialog',
);

export const AddEndpointButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddEndpointDialog, {
        resolve: { offering, refetch },
        formId: ENDPOINT_FORM_ID,
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircle />}
      title={translate('Add endpoint')}
      action={callback}
    />
  );
};
