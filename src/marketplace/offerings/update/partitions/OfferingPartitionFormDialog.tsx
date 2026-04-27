import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { omit } from 'lodash-es';
import { FC, useCallback } from 'react';
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
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

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
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const isEdit = Boolean(resolve.partition?.uuid);

  const onSubmit = useCallback(
    async (formData: OfferingPartitionRequest) => {
      if (!isEdit) {
        // Create
        try {
          await marketplaceProviderOfferingsAddPartition({
            path: { uuid: resolve.offering.uuid },
            body: {
              ...formData,
              offering: resolve.offering.uuid,
            },
          });
          showSuccess(translate('Offering partition has been added.'));
          await resolve.refetch();
          closeDialog();
        } catch (error) {
          showErrorResponse(
            error,
            translate('Unable to add offering partition.'),
          );
        }
      } else {
        // Edit
        try {
          await marketplaceProviderOfferingsUpdatePartitionPartialUpdate({
            path: { uuid: resolve.offering.uuid },
            body: {
              partition_uuid: resolve.partition.uuid,
              ...formData,
            },
          });
          showSuccess(translate('Offering partition has been updated.'));
          await resolve.refetch();
          closeDialog();
        } catch (error) {
          showErrorResponse(
            error,
            translate('Unable to update offering partition.'),
          );
        }
      }
    },
    [
      resolve.offering,
      resolve.partition,
      resolve.refetch,
      showSuccess,
      closeDialog,
      showErrorResponse,
    ],
  );

  return (
    <Form
      onSubmit={onSubmit}
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
