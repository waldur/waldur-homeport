import { useState } from 'react';
import { Form } from 'react-final-form';

import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { BroadcastFooter } from './BroadcastFooter';
import { BroadcastForm } from './BroadcastForm';
import { BroadcastFormData } from './types';
import { useBroadcastFormSubmit } from './utils';

interface BroadcastUpdateDialogOwnProps {
  initialValues?: BroadcastFormData;
  resolve: {
    uuid?: string;
    refetch(): void;
  };
}

export const BroadcastFormDialog = ({
  initialValues,
  resolve,
}: BroadcastUpdateDialogOwnProps) => {
  const [step, setStep] = useState(0);

  const isEdit = Boolean(resolve.uuid);

  const onSubmit = useBroadcastFormSubmit(resolve.refetch, resolve.uuid);

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, errors, values, form }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Update a broadcast')
                : translate('Create a broadcast')
            }
            footer={
              <BroadcastFooter
                step={step}
                setStep={setStep}
                refetch={resolve.refetch}
                form={form}
                disabled={
                  (errors && Object.keys(errors).length > 0) || submitting
                }
                formValues={values}
                uuid={resolve.uuid}
              />
            }
          >
            <BroadcastForm
              step={step}
              setStep={setStep}
              isNextDisabled={
                (errors && Object.keys(errors).length > 0) || submitting
              }
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
