import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsCreateOfferingComponent } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { formatComponent } from '../../store/utils';

import { ComponentForm } from './ComponentForm';

export const AddComponentDialog: FC<{
  resolve: { offering; refetch };
}> = (props) => {
  const createMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsCreateOfferingComponent({
        path: { uuid: props.resolve.offering.uuid },
        body: formatComponent(formData, props.resolve.offering),
      }),
    successMessage: translate(
      'Billing component has been created successfully.',
    ),
    errorMessage: translate('Unable to create billing component.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => createMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add component')}
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Confirm')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <ComponentForm offering={props.resolve.offering} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
