import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { ATTRIBUTE_FORM_ID } from './constants';

const EditCategoryDialog = lazyComponent(() =>
  import('./EditCategoryDialog').then((module) => ({
    default: module.EditCategoryDialog,
  })),
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
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
