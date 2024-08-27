import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { isOfferingTypeSchedulable } from '@waldur/marketplace/common/registry';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { EDIT_SCHEDULES_FORM_ID } from './constants';

const EditSchedulesDialog = lazyComponent(
  () => import('./EditSchedulesDialog'),
  'EditSchedulesDialog',
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
      iconNode={<PencilSimple weight="bold" />}
    />
  );
};
