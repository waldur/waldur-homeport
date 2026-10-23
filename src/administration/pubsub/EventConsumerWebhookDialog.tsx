import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  EventConsumer,
  eventConsumersRegisterWebhook,
  eventConsumersUpdateWebhook,
  ObservableObjectTypeEnum,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { SecretGroup, SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ROLE_TYPES } from '@/permissions/constants';

import { getObjectTypeLabels } from './eventConsumers';

// Scope types a role can be granted on, as they appear in `scope_type` of a
// user_role message (the role's content type model name).
const SCOPE_TYPES = ['customer', 'project', 'offering', 'call', 'proposal'];

// The two payload filters the dialog edits. Any other filter key set through
// the API is kept untouched on save.
const ROLE_FILTER = 'role_name';
const SCOPE_FILTER = 'scope_type';

interface FormData {
  webhook_url?: string;
  object_types: Option[];
  role_names: Option[];
  scope_types: Option[];
}

interface EventConsumerWebhookDialogProps {
  resolve?: { consumer?: EventConsumer; refetch: () => void };
}

const toOptions = (values: unknown[] | undefined, options: Option[]) =>
  (values ?? []).map(String).map(
    (value): Option =>
      options.find((option) => option.value === value) ?? {
        value,
        label: value,
      },
  );

const optionValues = (options: Option[] | undefined) =>
  (options ?? []).map((option) => option.value);

export const EventConsumerWebhookDialog: FC<
  EventConsumerWebhookDialogProps
> = ({ resolve }) => {
  const consumer = resolve?.consumer;
  const isEdit = Boolean(consumer);

  const objectTypeOptions = useMemo<Option[]>(
    () =>
      Object.entries(getObjectTypeLabels()).map(([type, label]) => ({
        value: type,
        label: `${label} (${type})`,
      })),
    [],
  );
  const roleOptions = useMemo<Option[]>(
    () =>
      (ENV.roles ?? [])
        .filter((role) => role.is_active)
        .map((role) => ({
          value: role.name,
          label: role.description
            ? `${role.description} (${role.name})`
            : role.name,
        })),
    [],
  );
  const scopeTypeOptions = useMemo<Option[]>(
    () =>
      SCOPE_TYPES.map((type) => {
        const roleType = ROLE_TYPES.find((item) => item.value === type);
        return {
          value: type,
          label: roleType ? `${roleType.label} (${type})` : type,
        };
      }),
    [],
  );

  const initialValues = useMemo<FormData>(
    () => ({
      object_types: toOptions(consumer?.object_types, objectTypeOptions),
      role_names: toOptions(
        consumer?.payload_filters?.[ROLE_FILTER],
        roleOptions,
      ),
      scope_types: toOptions(
        consumer?.payload_filters?.[SCOPE_FILTER],
        scopeTypeOptions,
      ),
    }),
    [consumer, objectTypeOptions, roleOptions, scopeTypeOptions],
  );

  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (values) => {
      const payloadFilters = { ...(consumer?.payload_filters ?? {}) };
      delete payloadFilters[ROLE_FILTER];
      delete payloadFilters[SCOPE_FILTER];
      const roleNames = optionValues(values.role_names);
      const scopeTypes = optionValues(values.scope_types);
      if (roleNames.length) payloadFilters[ROLE_FILTER] = roleNames;
      if (scopeTypes.length) payloadFilters[SCOPE_FILTER] = scopeTypes;
      const objectTypes = optionValues(
        values.object_types,
      ) as ObservableObjectTypeEnum[];

      if (isEdit) {
        return eventConsumersUpdateWebhook({
          path: { uuid: consumer.uuid },
          body: {
            ...(values.webhook_url ? { webhook_url: values.webhook_url } : {}),
            object_types: objectTypes,
            payload_filters: payloadFilters,
          },
        });
      }
      return eventConsumersRegisterWebhook({
        body: {
          webhook_url: values.webhook_url,
          object_types: objectTypes,
          payload_filters: payloadFilters,
          scopes: [],
        },
      });
    },
    refetch: resolve?.refetch,
    successMessage: isEdit
      ? translate('Webhook consumer has been updated.')
      : translate('Webhook consumer has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update webhook consumer.')
      : translate('Unable to create webhook consumer.'),
  });

  return (
    <Form<FormData>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit webhook consumer')
                : translate('Add webhook consumer')
            }
            subtitle={translate(
              'Events are POSTed as JSON to an external HTTP listener, such as an ITSM or CRM system.',
            )}
            footer={
              <>
                <CloseDialogButton className="w-[175px]" />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Create')}
                  variant="primary"
                  className="w-[175px]"
                />
              </>
            }
          >
            {!isEdit && (
              <AlertItem
                type="floating"
                variant="warning"
                title={translate('Global consumer')}
                body={translate(
                  'This consumer receives events about every user in the system, including names and email addresses. Narrow it down with object types and filters, and only point it at a system you trust.',
                )}
                className="mb-6"
              />
            )}
            <SecretGroup
              name="webhook_url"
              label={translate('Webhook URL')}
              placeholder="https://listener.example.com/hook?sig=…"
              description={
                isEdit
                  ? translate(
                      'Leave empty to keep the current URL ({destination}).',
                      { destination: consumer.webhook_destination },
                    )
                  : translate(
                      'Public https address. A credential in the query string is fine: the URL is stored as a secret and never shown again. user:password@ is not accepted.',
                    )
              }
              validate={isEdit ? undefined : required}
              required={!isEdit}
            />
            <SelectGroup
              name="object_types"
              label={translate('Object types')}
              description={translate('Leave empty to receive every type.')}
              placeholder={translate('All types')}
              options={objectTypeOptions}
              isMulti
            />
            <SelectGroup
              name="role_names"
              label={translate('Only these roles')}
              description={translate(
                'Deliver only messages whose role is one of these. Messages that carry no role, such as profile changes, are then not delivered.',
              )}
              placeholder={translate('Any role')}
              options={roleOptions}
              isMulti
            />
            <SelectGroup
              name="scope_types"
              label={translate('Only these scope types')}
              description={translate(
                'Deliver only role changes on these kinds of scope, e.g. organizations.',
              )}
              placeholder={translate('Any scope type')}
              options={scopeTypeOptions}
              isMulti
              spaceless
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
