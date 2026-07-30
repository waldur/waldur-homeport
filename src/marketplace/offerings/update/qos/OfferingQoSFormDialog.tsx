import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { omit } from 'lodash-es';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsAddQos,
  marketplaceProviderOfferingsUpdateQosPartialUpdate,
  NestedQoS,
  OfferingQoSRequest,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OfferingQoSForm } from './OfferingQoSForm';

interface OfferingQoSFormDialogProps {
  resolve: {
    qos?: NestedQoS; // For edit mode
    offering: any;
    refetch: () => Promise<void>;
  };
}

export const OfferingQoSFormDialog: FC<OfferingQoSFormDialogProps> = ({
  resolve,
}) => {
  const isEdit = Boolean(resolve.qos?.uuid);

  const saveQoSMutation = useManagedMutation<any, any, OfferingQoSRequest>({
    mutationFn: (formData) => {
      if (!isEdit) {
        return marketplaceProviderOfferingsAddQos({
          path: { uuid: resolve.offering.uuid },
          body: { ...formData, offering: resolve.offering.uuid },
        });
      } else {
        return marketplaceProviderOfferingsUpdateQosPartialUpdate({
          path: { uuid: resolve.offering.uuid },
          body: { qos_uuid: resolve.qos.uuid, ...formData },
        });
      }
    },
    successMessage: isEdit
      ? translate('QoS profile has been updated.')
      : translate('QoS profile has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update QoS profile.')
      : translate('Unable to add QoS profile.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<OfferingQoSRequest>
      onSubmit={(values) => saveQoSMutation.mutateAsync(values)}
      initialValues={isEdit ? { ...omit(resolve.qos, ['uuid']) } : undefined}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit QoS profile')
                : translate('Add QoS profile')
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
            <OfferingQoSForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
