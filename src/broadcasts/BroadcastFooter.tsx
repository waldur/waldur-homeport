import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FloppyDiskIcon,
  ShareIcon,
} from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ActionButton } from '@waldur/table/ActionButton';

import { BroadcastFormData } from './types';

const BroadcastSaveAsTemplateDialog = lazyComponent(() =>
  import('./BroadcastSaveAsTemplateDialog').then((module) => ({
    default: module.BroadcastSaveAsTemplateDialog,
  })),
);

export const BroadcastFooter = ({
  step,
  setStep,
  refetch,
  form,
  disabled,
  formValues,
  uuid,
}: {
  step;
  setStep;
  refetch;
  form;
  disabled;
  formValues: BroadcastFormData;
  uuid?: string;
}) => {
  const dispatch = useDispatch();

  const saveAsTemplate = () =>
    dispatch(
      openModalDialog(BroadcastSaveAsTemplateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
          broadcastData: formValues,
          broadcastUuid: uuid, // If we go back to this form, we need to pass uuid
        },
        size: 'lg',
      }),
    );

  return (
    <>
      {step === 0 ? (
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={false}
            onClick={() => form.change('action', 'draft')}
            variant="secondary"
            disabled={disabled}
            iconNode={<FloppyDiskIcon weight="bold" />}
            iconOnLeft
            label={translate('Save as draft')}
          />
          <ActionButton
            action={saveAsTemplate}
            variant="secondary"
            disabled={disabled}
            iconNode={<FloppyDiskIcon weight="bold" />}
            title={translate('Save as a template')}
          />
          <ActionButton
            action={() => setStep(1)}
            disabled={disabled}
            iconNode={<ArrowRightIcon weight="bold" />}
            title={translate('Select recipients')}
          />
        </>
      ) : (
        <>
          <ActionButton
            action={() => setStep(0)}
            variant="secondary"
            iconNode={<ArrowLeftIcon weight="bold" />}
            title={translate('Back')}
          />
          <SubmitButton
            submitting={false}
            variant="secondary"
            onClick={() => form.change('action', 'draft')}
            disabled={disabled}
            iconNode={<FloppyDiskIcon weight="bold" />}
            iconOnLeft
            label={translate('Save as draft')}
          />
          <SubmitButton
            submitting={false}
            onClick={() => form.change('action', 'submit')}
            disabled={disabled}
            iconNode={<ShareIcon weight="bold" />}
            iconOnLeft
            label={
              formValues.send_at
                ? translate('Schedule broadcast')
                : translate('Send now')
            }
          />
        </>
      )}
    </>
  );
};
