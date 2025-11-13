import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FloppyDiskIcon,
  ShareIcon,
} from '@phosphor-icons/react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

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
    <Modal.Footer className="border-0 pt-0 gap-2">
      {step === 0 ? (
        <>
          <CloseDialogButton />
          <Button
            type="submit"
            onClick={() => form.change('action', 'draft')}
            variant="secondary"
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDiskIcon weight="bold" />
            </span>{' '}
            {translate('Save as draft')}
          </Button>
          <Button
            onClick={saveAsTemplate}
            variant="secondary"
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDiskIcon weight="bold" />
            </span>{' '}
            {translate('Save as a template')}
          </Button>
          <Button onClick={() => setStep(1)} disabled={disabled}>
            <span className="svg-icon svg-icon-2">
              <ArrowRightIcon weight="bold" />
            </span>{' '}
            {translate('Select recipients')}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => setStep(0)} variant="secondary">
            <span className="svg-icon svg-icon-2">
              <ArrowLeftIcon weight="bold" />
            </span>{' '}
            {translate('Back')}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            onClick={() => form.change('action', 'draft')}
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDiskIcon weight="bold" />
            </span>{' '}
            {translate('Save as draft')}
          </Button>
          <Button
            type="submit"
            onClick={() => form.change('action', 'submit')}
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <ShareIcon weight="bold" />
            </span>{' '}
            {formValues.send_at
              ? translate('Schedule broadcast')
              : translate('Send now')}
          </Button>
        </>
      )}
    </Modal.Footer>
  );
};
