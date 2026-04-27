import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { isOfferingTypeSchedulable } from '@/marketplace/common/registry';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { EDIT_SCHEDULES_FORM_ID } from './constants';

const EditSchedulesDialog = lazyComponent(() =>
  import('./EditSchedulesDialog').then((module) => ({
    default: module.EditSchedulesDialog,
  })),
);

export const EditSchedulesButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditSchedulesDialog, {
        resolve: { offering, refetch },
        size: 'lg',
        formId: EDIT_SCHEDULES_FORM_ID,
      }),
    );
  };
  const isSchedulable = isOfferingTypeSchedulable(offering.type);
  if (!isSchedulable) {
    return null;
  }
  return (
    <ActionButton
      action={callback}
      title={translate('Edit schedules')}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
