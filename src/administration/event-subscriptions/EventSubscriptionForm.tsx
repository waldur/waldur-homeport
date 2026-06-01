import { Form } from 'react-final-form';
import {
  eventSubscriptionsCreate,
  EventSubscription,
  EventSubscriptionRequest,
} from 'waldur-js-client';

import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EVENT_SUBSCRIPTIONS_QUERY_KEY } from './utils';

interface EventSubscriptionFormProps {
  resolve: {
    subscription?: EventSubscription;
    refetch: () => void;
  };
}

export const EventSubscriptionForm = ({
  resolve,
}: EventSubscriptionFormProps) => {
  const isEdit = Boolean(resolve.subscription);

  const initialValues = isEdit
    ? {
        description: resolve.subscription.description,
      }
    : undefined;

  const onSubmitMutation = useManagedMutation<
    any,
    any,
    EventSubscriptionRequest
  >({
    mutationFn: (formValues) => {
      if (isEdit) {
        return Promise.resolve();
      } else {
        return eventSubscriptionsCreate({
          body: {
            description: formValues.description || undefined,
          },
        });
      }
    },
    successMessage: isEdit
      ? translate('Event subscription has been updated')
      : translate('Event subscription has been created'),
    errorMessage: isEdit
      ? translate('Unable to update the event subscription.')
      : translate('Unable to create an event subscription.'),
    refetch: resolve.refetch,
    invalidateQueries: [
      {
        queryKey: EVENT_SUBSCRIPTIONS_QUERY_KEY,
      },
    ],
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit event subscription')
                : translate('Create event subscription')
            }
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={isEdit ? translate('Update') : translate('Create')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <TextGroup
              name="description"
              placeholder={translate(
                'Enter a description for this subscription',
              )}
              rows={3}
              label={translate('Description')}
            />

            <div className="alert alert-info">
              {translate(
                'Event subscriptions allow external systems to receive notifications about changes in Waldur. After creating a subscription, configure observable objects via the API.',
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
