import { FunctionComponent } from 'react';
import { Field, Form } from 'react-final-form';
import { useAsync } from 'react-use';
import {
  EventGroupsEnum,
  hooksEmailCreate,
  hooksEmailPartialUpdate,
  hooksWebCreate,
  hooksWebPartialUpdate,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { titleCase } from '@/core/utils';
import { required } from '@/core/validators';
import { StringField, SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { HookTypeField } from './HookTypeField';
import { MultiSelectField } from './MultiSelectField';
import { HookFormData, HookResponse, HookType } from './types';
import { loadEventGroupsOptions } from './utils';

const useHookForm = (hook, refetch) => {
  const saveHookMutation = useManagedMutation<any, any, HookFormData>({
    mutationFn: async (formData) => {
      const hookType = hook ? hook.hook_type : formData.hook_type;
      const event_groups = Object.keys(
        formData.event_groups,
      ) as EventGroupsEnum[];
      if (hook) {
        if (hookType == 'email') {
          await hooksEmailPartialUpdate({
            path: { uuid: hook.uuid },
            body: {
              is_active: formData.is_active,
              email: formData.email,
              event_groups,
            },
          });
        } else {
          await hooksWebPartialUpdate({
            path: { uuid: hook.uuid },
            body: {
              is_active: formData.is_active,
              destination_url: formData.destination_url,
              event_groups,
            },
          });
        }
      } else {
        if (hookType == 'email') {
          await hooksEmailCreate({
            body: {
              is_active: formData.is_active,
              email: formData.email,
              event_groups,
            },
          });
        } else {
          await hooksWebCreate({
            body: {
              is_active: formData.is_active,
              destination_url: formData.destination_url,
              event_groups,
            },
          });
        }
      }
    },
    successMessage: hook
      ? translate('Notification has been updated.')
      : translate('Notification has been created.'),
    errorMessage: hook
      ? translate('Unable to update notification.')
      : translate('Unable to create notification.'),
    refetch,
  });
  const initialValues = hook
    ? {
        is_active: hook.is_active,
        hook_type: hook.hook_type as HookType,
        email: hook.email,
        destination_url: hook.destination_url,
        event_groups: hook.event_groups.reduce(
          (result, group) => ({ ...result, [group]: true }),
          {},
        ),
      }
    : {
        hook_type: 'webhook' as HookType,
        event_groups: {},
      };
  const state = useAsync(loadEventGroupsOptions);
  return {
    saveHook: (values) =>
      saveHookMutation.mutateAsync(values).catch(() => {
        /* error handled by useManagedMutation */
      }),
    initialValues,
    state,
  };
};

export const HookDetailsDialog: FunctionComponent<{
  resolve: { hook?: HookResponse; refetch };
}> = ({ resolve: { hook, refetch } }) => {
  const {
    saveHook,
    initialValues,
    state: { loading, error, value: eventGroups },
  } = useHookForm(hook, refetch);

  return (
    <Form<HookFormData>
      onSubmit={saveHook}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              hook
                ? translate('Update notification')
                : translate('Create notification')
            }
            footer={
              <SubmitButton
                variant="primary"
                submitting={submitting}
                invalid={invalid}
              >
                {hook ? translate('Update') : translate('Create')}
              </SubmitButton>
            }
          >
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <>{translate('Unable to load data.')}</>
            ) : (
              <>
                {!hook ? (
                  <Field
                    name="hook_type"
                    validate={required}
                    render={({ input }) => (
                      <HookTypeField
                        input={input}
                        defaultValue={initialValues.hook_type}
                      />
                    )}
                  />
                ) : (
                  <>
                    <FormGroup label={translate('Notification method')}>
                      {titleCase(values.hook_type)}
                    </FormGroup>
                    <Field
                      name="is_active"
                      component={AwesomeCheckboxField}
                      label={translate('Enabled')}
                    />
                  </>
                )}
                {values.hook_type === 'email' ? (
                  <FormGroup label={translate('Email address')} required>
                    <Field
                      name="email"
                      component={StringField}
                      type="email"
                      validate={required}
                      data-testid="email-address"
                    />
                  </FormGroup>
                ) : values.hook_type === 'webhook' ? (
                  <FormGroup label={translate('Destination URL')} required>
                    <Field
                      name="destination_url"
                      component={StringField}
                      type="url"
                      validate={required}
                      data-testid="destination-url"
                    />
                  </FormGroup>
                ) : null}
                <Field
                  name="event_groups"
                  render={({ input }) => (
                    <MultiSelectField input={input} options={eventGroups} />
                  )}
                />
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
