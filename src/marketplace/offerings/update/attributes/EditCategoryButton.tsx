import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ATTRIBUTE_FORM_ID } from './constants';

const EditCategoryDialog = lazyComponent(
  () => import('./EditCategoryDialog'),
  'EditCategoryDialog',
);

export const EditCategoryButton: FunctionComponent<{
  offering;
  category;
  refetch;
}> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditCategoryDialog, {
        resolve: props,
        formId: ATTRIBUTE_FORM_ID,
      }),
    );
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Edit category')}
      icon="fa fa-pencil"
    />
  );
};
