import { DateTime } from 'luxon';
import React from 'react';
import { Form } from 'react-final-form';
import { marketplaceResourceEndDateChangeRequestsCreate } from 'waldur-js-client';

import { formatISODate } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { DateGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface RequestEndDateChangeDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
      name?: string;
      end_date?: string;
      project_end_date?: string;
    };
    refetch?: () => void;
  };
}

export const RequestEndDateChangeDialog: React.FC<
  RequestEndDateChangeDialogProps
> = (props) => {
  const { resource, refetch } = props.resolve;

  const mutation = useManagedMutation({
    mutationFn: (formData: any) =>
      marketplaceResourceEndDateChangeRequestsCreate({
        body: {
          resource: resource.marketplace_resource_uuid,
          requested_end_date: formatISODate(formData.requested_end_date),
          comment: formData.comment,
        },
      }),
    successMessage: translate('End date change request has been submitted.'),
    errorMessage: translate('Unable to submit end date change request.'),
    refetch,
  });

  return (
    <Form
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={{ requested_end_date: resource.end_date }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Request end date change')}
            footer={
              <>
                <CloseDialogButton label={translate('Cancel')} />
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={translate('Send for Approval')}
                />
              </>
            }
          >
            <p className="text-gray-700">
              {translate(
                'Ask for the end date of this resource to be changed. Someone who can change it will review your request.',
              )}
            </p>
            <DateGroup
              name="requested_end_date"
              label={translate('Requested end date')}
              required
              validate={required}
              minDate={DateTime.now().plus({ days: 1 }).toISO()}
              maxDate={resource.project_end_date}
            />
            <TextGroup
              name="comment"
              label={translate('Comment')}
              placeholder={translate('Why is the change needed?')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
