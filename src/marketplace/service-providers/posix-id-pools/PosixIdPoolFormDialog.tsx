import { FORM_ERROR } from 'final-form';
import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  marketplacePosixIdPoolsCreate,
  marketplacePosixIdPoolsPartialUpdate,
  PosixIdPool,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  NumberGroup,
  SelectGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

const POSIX_ID_POOL_SCOPE_OPTIONS = [
  { label: translate('Service provider (default)'), value: 'service_provider' },
  { label: translate('Offering (override)'), value: 'offering' },
];

interface PosixIdPoolFormDialogProps {
  resolve: {
    pool?: PosixIdPool;
    providerUuid?: string;
    customerUuid?: string;
    refetch: () => void;
  };
}

interface FormValues {
  scope: string;
  offering?: { uuid: string; name: string } | null;
  // Each range is optional but all-or-nothing; at least one must be defined.
  min_uid?: number | null;
  max_uid?: number | null;
  min_gid?: number | null;
  max_gid?: number | null;
  description?: string;
}

const validatePool = (values: FormValues) => {
  const errors: Record<string, string> = {};
  const missing = translate('Set both the minimum and maximum, or neither.');
  const uidTouched = values.min_uid != null || values.max_uid != null;
  const gidTouched = values.min_gid != null || values.max_gid != null;
  if (uidTouched && values.min_uid == null) errors.min_uid = missing;
  if (uidTouched && values.max_uid == null) errors.max_uid = missing;
  if (gidTouched && values.min_gid == null) errors.min_gid = missing;
  if (gidTouched && values.max_gid == null) errors.max_gid = missing;
  const uidComplete = values.min_uid != null && values.max_uid != null;
  const gidComplete = values.min_gid != null && values.max_gid != null;
  if (!uidComplete && !gidComplete) {
    errors.min_uid = translate('Define at least one of the UID or GID ranges.');
  }
  return errors;
};

const ScopeFields: FC<{ customerUuid?: string; submitting: boolean }> = ({
  customerUuid,
  submitting,
}) => {
  const { values } = useFormState<FormValues>();

  const loadOfferings = useMemo(
    () => providerOfferingsAutocomplete({ customer_uuid: customerUuid }),
    [customerUuid],
  );

  return (
    <>
      <SelectGroup
        name="scope"
        label={translate('Scope')}
        description={translate(
          'A service-provider pool applies to all offerings by default. An offering pool overrides it for a single offering.',
        )}
        options={POSIX_ID_POOL_SCOPE_OPTIONS}
        simpleValue
        isClearable={false}
        required
        validate={required}
        disabled={submitting}
      />
      {values.scope === 'offering' && (
        <AsyncSelectGroup
          name="offering"
          label={translate('Offering')}
          loadOptions={loadOfferings}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          required
          validate={required}
          disabled={submitting}
        />
      )}
    </>
  );
};

export const PosixIdPoolFormDialog: FC<PosixIdPoolFormDialogProps> = (
  props,
) => {
  const pool = props.resolve.pool;
  const isEdit = Boolean(pool?.uuid);

  const initialValues = useMemo<FormValues>(
    () =>
      pool
        ? {
            scope: pool.scope ?? 'service_provider',
            min_uid: pool.min_uid ?? undefined,
            max_uid: pool.max_uid ?? undefined,
            min_gid: pool.min_gid ?? undefined,
            max_gid: pool.max_gid ?? undefined,
            description: pool.description ?? '',
          }
        : ({ scope: 'service_provider' } as FormValues),
    [pool],
  );

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      isEdit
        ? marketplacePosixIdPoolsPartialUpdate({
            path: { uuid: pool!.uuid! },
            body: {
              min_uid: values.min_uid ?? null,
              max_uid: values.max_uid ?? null,
              min_gid: values.min_gid ?? null,
              max_gid: values.max_gid ?? null,
              description: values.description,
            },
          })
        : marketplacePosixIdPoolsCreate({
            body: {
              min_uid: values.min_uid ?? null,
              max_uid: values.max_uid ?? null,
              min_gid: values.min_gid ?? null,
              max_gid: values.max_gid ?? null,
              description: values.description,
              service_provider:
                values.scope === 'service_provider'
                  ? props.resolve.providerUuid
                  : undefined,
              offering:
                values.scope === 'offering' ? values.offering?.uuid : undefined,
            },
          }),
    successMessage: isEdit
      ? translate('POSIX ID pool has been updated.')
      : translate('POSIX ID pool has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update POSIX ID pool.')
      : translate('Unable to create POSIX ID pool.'),
    refetch: props.resolve.refetch,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        // The fetch client spreads the parsed error body directly onto `e`
        // (alongside the raw `response`). Keep per-field errors AND surface
        // non-field errors (e.g. the provider-wide overlap message) as an
        // inline form-level banner.
        const { response: _response, ...data } = e;
        return {
          ...data,
          [FORM_ERROR]: data.non_field_errors?.[0] || data.detail,
        };
      }
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      validate={validatePool}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, submitError }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit POSIX ID pool')
                : translate('Create POSIX ID pool')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <div className="size-sm">
              {submitError && (
                <div className="alert alert-danger" role="alert">
                  {submitError}
                </div>
              )}
              {!isEdit && (
                <ScopeFields
                  customerUuid={props.resolve.customerUuid}
                  submitting={submitting}
                />
              )}
              <p className="text-muted fs-7 mb-3">
                {translate(
                  'Define at least one range. Leave a range empty to source it externally — for example UIDs from an OIDC claim while GIDs are allocated by Waldur.',
                )}
              </p>
              <div className="row">
                <div className="col-sm-6">
                  <NumberGroup
                    name="min_uid"
                    label={translate('Minimum UID')}
                    description={translate(
                      'First UID of the pool (inclusive).',
                    )}
                    disabled={submitting}
                  />
                </div>
                <div className="col-sm-6">
                  <NumberGroup
                    name="max_uid"
                    label={translate('Maximum UID')}
                    description={translate('Last UID of the pool (inclusive).')}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <NumberGroup
                    name="min_gid"
                    label={translate('Minimum GID')}
                    description={translate(
                      'First GID of the pool (inclusive).',
                    )}
                    disabled={submitting}
                  />
                </div>
                <div className="col-sm-6">
                  <NumberGroup
                    name="max_gid"
                    label={translate('Maximum GID')}
                    description={translate('Last GID of the pool (inclusive).')}
                    disabled={submitting}
                  />
                </div>
              </div>
              <TextGroup
                label={translate('Description')}
                name="description"
                required={false}
                disabled={submitting}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
