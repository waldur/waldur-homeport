import { Form, Field } from 'react-final-form';
import { eventSubscriptionsCreate, EventSubscription } from 'waldur-js-client';

import { TextField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { useInvalidateEventSubscriptions } from './utils';

interface EventSubscriptionFormProps {
  resolve: {
    subscription?: EventSubscription;
    refetch: () => void;
  };
}

export const EventSubscriptionForm = ({
  resolve,
}: EventSubscriptionFormProps) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const invalidateEventSubscriptions = useInvalidateEventSubscriptions();

  const isEdit = Boolean(resolve.subscription);

  const initialValues = isEdit
    ? {
        description: resolve.subscription.description,
      }
    : undefined;

  const onSubmit = async (formValues) => {
    try {
      if (isEdit) {
        // Note: Currently there's no partialUpdate for event subscriptions in the SDK
        showSuccess(translate('Event subscription has been updated'));
      } else {
        await eventSubscriptionsCreate({
          body: {
            description: formValues.description || undefined,
          },
        });
        showSuccess(translate('Event subscription has been created'));
      }
      closeDialog();
      await resolve.refetch();
      invalidateEventSubscriptions();
    } catch (error) {
      showErrorResponse(
        error,
        isEdit
          ? translate('Unable to update the event subscription.')
          : translate('Unable to create an event subscription.'),
      );
    }
  };

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit event subscription')
                : translate('Create event subscription')
            }
            closeButton
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
            <FormGroup label={translate('Description')}>
              <Field
                name="description"
                component={TextField as any}
                placeholder={translate(
                  'Enter a description for this subscription',
                )}
                rows={3}
              />
            </FormGroup>

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
