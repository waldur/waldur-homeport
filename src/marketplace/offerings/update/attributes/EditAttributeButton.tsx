import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

import { ATTRIBUTE_FORM_ID } from './constants';
import { EditAttributeDialogProps } from './types';

const EditAttributeDialog = lazyComponent(
  () => import('./EditAttributeDialog'),
  'EditAttributeDialog',
);

export const EditAttributeButton: FunctionComponent<
  EditAttributeDialogProps
> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditAttributeDialog, {
        resolve: props,
        formId: ATTRIBUTE_FORM_ID,
      }),
    );
  };
  return (
    <RowActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      size="sm"
    />
  );
};
