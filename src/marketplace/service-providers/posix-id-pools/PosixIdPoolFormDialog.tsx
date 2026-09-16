import { FORM_ERROR } from 'final-form';
import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  marketplacePosixIdPoolsCreate,
  marketplacePosixIdPoolsPartialUpdate,
  PosixIdPool,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
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

import {
  buildPoolValidator,
  NAMESPACES,
  NamespaceKey,
  POSIX_ID_MAX,
  POSIX_ID_MIN,
  PoolFormValues,
  poolValue,
  scopeLabel,
} from './poolRanges';

const POSIX_ID_POOL_SCOPE_OPTIONS = [
  { label: translate('Service provider (default)'), value: 'service_provider' },
  { label: translate('Offering (override)'), value: 'offering' },
];

const NAMESPACE_LABELS: Record<NamespaceKey, () => string> = {
  uid: () => translate('UIDs'),
  gid: () => translate('GIDs'),
};

interface PosixIdPoolFormDialogProps {
  resolve: {
    pool?: PosixIdPool;
    providerUuid?: string;
    customerUuid?: string;
    /** The pools listed alongside; the provider's others must not overlap. */
    pools?: PosixIdPool[];
    refetch: () => void;
  };
}

type FormValues = PoolFormValues & {
  scope: string;
  offering?: { uuid: string; name: string } | null;
  description?: string;
};

/** What a range may hold: the global bounds, the other pools, the allocations. */
const RangeGuidance: FC<{ pool?: PosixIdPool; siblings: PosixIdPool[] }> = ({
  pool,
  siblings,
}) => {
  const taken = NAMESPACES.flatMap((ns) =>
    siblings
      .filter((other) => poolValue(other, `min_${ns}`) != null)
      .map((other) =>
        translate('{namespace} {min}–{max} ({scope})', {
          namespace: NAMESPACE_LABELS[ns](),
          min: poolValue(other, `min_${ns}`),
          max: poolValue(other, `max_${ns}`),
          scope: scopeLabel(other),
        }),
      ),
  );
  const allocated = pool
    ? NAMESPACES.filter(
        (ns) =>
          poolValue(pool, `min_${ns}`) != null &&
          (poolValue(pool, `${ns}_used`) ?? 0) > 0,
      ).map((ns) =>
        translate(
          '{count} {namespace} are allocated from this pool; the next new one is {next}. The range may shrink, but every allocated value must stay inside it.',
          {
            count: poolValue(pool, `${ns}_used`),
            namespace: NAMESPACE_LABELS[ns](),
            next: poolValue(pool, `next_${ns}`),
          },
        ),
      )
    : [];
  return (
    <AlertItem
      variant="info"
      className="mb-5"
      title={translate('Allowed values: {min} to {max}', {
        min: POSIX_ID_MIN,
        max: POSIX_ID_MAX,
      })}
      body={
        <ul className="mb-0 ps-4">
          <li>
            {translate(
              'Values below {min} are reserved for system accounts on the hosts.',
              { min: POSIX_ID_MIN },
            )}
          </li>
          <li>
            {translate(
              'The pools of one service provider must not overlap: UIDs against UIDs, GIDs against GIDs. A UID and a GID may share a number, so the same range can serve both.',
            )}
          </li>
          {taken.length > 0 && (
            <li>
              {translate('Already used by other pools: {ranges}.', {
                ranges: taken.join(', '),
              })}
            </li>
          )}
          {allocated.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      }
    />
  );
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
  const customerUuid = pool?.customer_uuid ?? props.resolve.customerUuid;

  // Only the same provider's pools constrain this one; an admin list mixes
  // organizations.
  const siblings = useMemo(
    () =>
      (props.resolve.pools ?? []).filter(
        (other) =>
          other.customer_uuid === customerUuid && other.uuid !== pool?.uuid,
      ),
    [props.resolve.pools, customerUuid, pool?.uuid],
  );
  const validate = useMemo(() => buildPoolValidator(siblings), [siblings]);

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
      validate={validate}
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
                <AlertItem
                  variant="error"
                  title={submitError}
                  className="mb-4"
                />
              )}
              {!isEdit && (
                <ScopeFields
                  customerUuid={props.resolve.customerUuid}
                  submitting={submitting}
                />
              )}
              <RangeGuidance pool={pool} siblings={siblings} />
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
