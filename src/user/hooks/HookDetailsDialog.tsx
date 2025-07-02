import { FunctionComponent } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import {
  EventGroupsEnum,
  hooksEmailCreate,
  hooksEmailPartialUpdate,
  hooksWebCreate,
  hooksWebPartialUpdate,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { titleCase } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { HookTypeField } from './HookTypeField';
import { MultiSelectField } from './MultiSelectField';
import { HookFormData, HookResponse, HookType } from './types';
import { loadEventGroupsOptions } from './utils';

const useHookForm = (hook, refetch) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const dispatch = useDispatch();
  const saveHook = async (formData: HookFormData) => {
    const hookType = hook ? hook.hook_type : formData.hook_type;
    const event_groups = Object.keys(
      formData.event_groups,
    ) as EventGroupsEnum[];
    if (hook) {
      try {
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
        await refetch();
        showSuccess(translate('Notification has been updated.'));
        dispatch(closeModalDialog());
      } catch (e) {
        showErrorResponse(e, translate('Unable to update notification.'));
      }
    } else {
      try {
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
        await refetch();
        showSuccess(translate('Notification has been created.'));
        dispatch(closeModalDialog());
      } catch (e) {
        showErrorResponse(e, translate('Unable to create notification.'));
      }
    }
  };
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
  return { saveHook, initialValues, state };
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
                    component={HookTypeField as any}
                    validate={required}
                    hideLabel={true}
                  />
                ) : (
                  <>
                    <FormGroup label={translate('Notification method')}>
                      {titleCase(values.hook_type)}
                    </FormGroup>
                    <Field
                      name="is_active"
                      component={AwesomeCheckboxField as any}
                      label={translate('Enabled')}
                    />
                  </>
                )}
                {values.hook_type === 'email' ? (
                  <FormGroup label={translate('Email address')} required>
                    <Field
                      name="email"
                      component={StringField as any}
                      type="email"
                      validate={required}
                      data-testid="email-address"
                    />
                  </FormGroup>
                ) : values.hook_type === 'webhook' ? (
                  <FormGroup label={translate('Destination URL')} required>
                    <Field
                      name="destination_url"
                      component={StringField as any}
                      type="url"
                      validate={required}
                      data-testid="destination-url"
                    />
                  </FormGroup>
                ) : null}
                <Field
                  name="event_groups"
                  component={MultiSelectField as any}
                  options={eventGroups}
                  hideLabel={true}
                />
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
