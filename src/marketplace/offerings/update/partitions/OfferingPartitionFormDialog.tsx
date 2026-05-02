import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { omit } from 'lodash-es';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsAddPartition,
  marketplaceProviderOfferingsUpdatePartitionPartialUpdate,
  NestedPartition,
  OfferingPartitionRequest,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OfferingPartitionForm } from './OfferingPartitionForm';

interface OfferingPartitionFormDialogProps {
  resolve: {
    partition?: NestedPartition; // For edit mode
    offering: any;
    refetch: () => Promise<void>;
  };
}

export const OfferingPartitionFormDialog: FC<
  OfferingPartitionFormDialogProps
> = ({ resolve }) => {
  const isEdit = Boolean(resolve.partition?.uuid);

  const savePartitionMutation = useManagedMutation<
    any,
    any,
    OfferingPartitionRequest
  >({
    mutationFn: (formData) => {
      if (!isEdit) {
        return marketplaceProviderOfferingsAddPartition({
          path: { uuid: resolve.offering.uuid },
          body: {
            ...formData,
            offering: resolve.offering.uuid,
          },
        });
      } else {
        return marketplaceProviderOfferingsUpdatePartitionPartialUpdate({
          path: { uuid: resolve.offering.uuid },
          body: {
            partition_uuid: resolve.partition.uuid,
            ...formData,
          },
        });
      }
    },
    successMessage: isEdit
      ? translate('Offering partition has been updated.')
      : translate('Offering partition has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update offering partition.')
      : translate('Unable to add offering partition.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<OfferingPartitionRequest>
      onSubmit={(values) => savePartitionMutation.mutateAsync(values)}
      initialValues={
        isEdit ? { ...omit(resolve.partition, ['uuid']) } : undefined
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit offering partition')
                : translate('Add offering partition')
            }
            bodyClassName="h-500px"
            footer={
              <>
                <CloseDialogButton className="w-125px" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={isEdit ? translate('Edit') : translate('Add')}
                  className="btn btn-primary w-125px"
                />
              </>
            }
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor="success"
          >
            <OfferingPartitionForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
