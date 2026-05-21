import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FloppyDiskIcon,
  ShareIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ActionButton } from '@/table/ActionButton';
import { ProgressStep, Wizard, WizardFooterRenderProps } from '@/wizard';

import { MessageStep, RecipientsStep } from './steps';
import { BroadcastFormData } from './types';
import { useBroadcastFormSubmit } from './utils';

const BroadcastSaveAsTemplateDialog = lazyComponent(() =>
  import('./BroadcastSaveAsTemplateDialog').then((module) => ({
    default: module.BroadcastSaveAsTemplateDialog,
  })),
);

interface BroadcastFormDialogProps {
  initialValues?: BroadcastFormData;
  resolve: {
    uuid?: string;
    refetch(): void;
  };
}

const steps: ProgressStep[] = [
  { key: 'message', label: translate('Create message'), completed: false },
  {
    key: 'recipients',
    label: translate('Select recipients'),
    completed: false,
  },
];

const wizardForms = [MessageStep, RecipientsStep];

export const BroadcastFormDialog: FC<BroadcastFormDialogProps> = ({
  initialValues,
  resolve,
}) => {
  const { openDialog } = useModal();
  const isEdit = Boolean(resolve.uuid);
  const onSubmit = useBroadcastFormSubmit(resolve.refetch, resolve.uuid);

  const saveAsTemplate = useCallback((formValues: BroadcastFormData) => {
    openDialog(BroadcastSaveAsTemplateDialog, {
      dialogClassName: 'modal-dialog-centered',
      resolve: {
        refetch: resolve.refetch,
        broadcastData: formValues,
      },
      size: 'lg',
    });
  }, []);

  const renderFooter = useCallback(
    (props: WizardFooterRenderProps<BroadcastFormData>) => {
      const disabled = props.invalid || props.submitting;

      if (props.step === 0) {
        return (
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={false}
              onClick={() => props.form.change('action', 'draft')}
              variant="secondary"
              disabled={disabled}
              iconNode={<FloppyDiskIcon weight="bold" />}
              iconOnLeft
              label={translate('Save as draft')}
            />
            <ActionButton
              action={() => saveAsTemplate(props.values)}
              variant="secondary"
              disabled={disabled}
              disabledReason={
                props.submitting
                  ? translate('Submitting...')
                  : translate('Please fill in all required fields')
              }
              iconNode={<FloppyDiskIcon weight="bold" />}
              title={translate('Save as a template')}
            />
            <ActionButton
              action={props.handleSubmit}
              disabled={disabled}
              disabledReason={
                props.submitting
                  ? translate('Submitting...')
                  : translate('Please fill in all required fields')
              }
              iconNode={<ArrowRightIcon weight="bold" />}
              title={translate('Select recipients')}
            />
          </>
        );
      }

      return (
        <>
          <ActionButton
            action={props.onPrev}
            variant="secondary"
            iconNode={<ArrowLeftIcon weight="bold" />}
            title={translate('Back')}
          />
          <SubmitButton
            submitting={false}
            variant="secondary"
            onClick={() => props.form.change('action', 'draft')}
            disabled={disabled}
            iconNode={<FloppyDiskIcon weight="bold" />}
            iconOnLeft
            label={translate('Save as draft')}
          />
          <SubmitButton
            submitting={false}
            onClick={() => props.form.change('action', 'submit')}
            disabled={disabled}
            iconNode={<ShareIcon weight="bold" />}
            iconOnLeft
            label={
              props.values.send_at
                ? translate('Schedule broadcast')
                : translate('Send now')
            }
          />
        </>
      );
    },
    [saveAsTemplate],
  );

  const defaultInitialValues = useMemo(
    () => ({
      ...initialValues,
    }),
    [initialValues],
  );

  return (
    <Wizard<BroadcastFormData>
      title={
        isEdit
          ? translate('Update a broadcast')
          : translate('Create a broadcast')
      }
      subtitle={translate('Create and send broadcast messages to users')}
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={onSubmit}
      initialValues={defaultInitialValues}
      renderFooter={renderFooter}
    />
  );
};
