import { FORM_ERROR } from 'final-form';
import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  marketplacePosixIdPoolsCreate,
  marketplacePosixIdPoolsPartialUpdate,
  PosixIdPool,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
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
  POSIX_ID_MAX,
  POSIX_ID_MIN,
  PoolFormValues,
  poolValue,
  RangeKey,
  RANGES,
  scopeLabel,
  toId,
} from './poolRanges';

const POSIX_ID_POOL_SCOPE_OPTIONS = [
  { label: translate('Service provider (default)'), value: 'service_provider' },
  { label: translate('Offering (override)'), value: 'offering' },
];

const RANGE_LABELS: Record<RangeKey, () => string> = {
  uid: () => translate('UIDs'),
  gid: () => translate('GIDs'),
  group_gid: () => translate('Project group GIDs'),
};

// The same, inside a sentence.
const RANGE_NOUNS: Record<RangeKey, () => string> = {
  uid: () => translate('UIDs'),
  gid: () => translate('GIDs'),
  group_gid: () => translate('project group GIDs'),
};

// Project groups draw only on the service provider's own pool.
const takesGroupRange = (scope?: string) => scope !== 'offering';

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
  const taken = RANGES.flatMap((ns) =>
    siblings
      .filter((other) => poolValue(other, `min_${ns}`) != null)
      .map((other) =>
        translate('{namespace} {min}–{max} ({scope})', {
          namespace: RANGE_LABELS[ns](),
          min: poolValue(other, `min_${ns}`),
          max: poolValue(other, `max_${ns}`),
          scope: scopeLabel(other),
        }),
      ),
  );
  const allocated = pool
    ? RANGES.filter(
        (ns) =>
          poolValue(pool, `min_${ns}`) != null &&
          (poolValue(pool, `${ns}_used`) ?? 0) > 0,
      ).map((ns) =>
        translate(
          '{count} {namespace} are allocated from this pool; the next new one is {next}. The range may shrink, but every allocated value must stay inside it.',
          {
            count: poolValue(pool, `${ns}_used`),
            namespace: RANGE_NOUNS[ns](),
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
          <li>
            {translate(
              'The project group range holds GIDs too, so it must not overlap any GID range, including this pool’s own.',
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

/** The range provider project groups take their GIDs from. */
const GroupRangeFields: FC<{ pool?: PosixIdPool; submitting: boolean }> = ({
  pool,
  submitting,
}) => (
  <>
    <h6 className="mt-2 mb-1">{translate('Project group GIDs')}</h6>
    <p className="text-muted fs-7 mb-3">
      {translate(
        'Optional. Reserves GIDs for the one POSIX group each project gets at this service provider. Without it, project groups take GIDs from the GID range shared with users’ primary groups. Set it before enabling project groups in the account settings.',
      )}
    </p>
    <div className="row">
      <div className="col-sm-6">
        <NumberGroup
          name="min_group_gid"
          label={translate('Minimum project group GID')}
          description={translate('First GID of the range (inclusive).')}
          disabled={submitting}
        />
      </div>
      <div className="col-sm-6">
        <NumberGroup
          name="max_group_gid"
          label={translate('Maximum project group GID')}
          description={translate('Last GID of the range (inclusive).')}
          disabled={submitting}
        />
      </div>
    </div>
    {pool?.next_group_gid != null && (
      <p className="text-muted fs-7 mb-3" data-testid="next-group-gid">
        {translate('Next project group GID: {next}', {
          next: pool.next_group_gid,
        })}
      </p>
    )}
  </>
);

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
            min_group_gid: pool.min_group_gid ?? undefined,
            max_group_gid: pool.max_group_gid ?? undefined,
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
              min_uid: toId(values.min_uid),
              max_uid: toId(values.max_uid),
              min_gid: toId(values.min_gid),
              max_gid: toId(values.max_gid),
              ...(takesGroupRange(pool!.scope) && {
                min_group_gid: toId(values.min_group_gid),
                max_group_gid: toId(values.max_group_gid),
              }),
              description: values.description,
            },
          })
        : marketplacePosixIdPoolsCreate({
            body: {
              min_uid: toId(values.min_uid),
              max_uid: toId(values.max_uid),
              min_gid: toId(values.min_gid),
              max_gid: toId(values.max_gid),
              ...(takesGroupRange(values.scope) && {
                min_group_gid: toId(values.min_group_gid),
                max_group_gid: toId(values.max_group_gid),
              }),
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
        // (alongside `response`, `status`, `statusText` and `url`, which
        // getErrorBody drops). Keep per-field errors AND surface
        // non-field errors (e.g. the provider-wide overlap message) as an
        // inline form-level banner.
        const data = getErrorBody(e) ?? {};
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
      render={({
        handleSubmit,
        submitting,
        hasValidationErrors,
        submitError,
        dirtySinceLastSubmit,
        values,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit POSIX ID pool')
                : translate('Create POSIX ID pool')
            }
            footer={
              <SubmitButton
                disabled={hasValidationErrors}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <div className="size-sm">
              {submitError && !dirtySinceLastSubmit && (
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
              {takesGroupRange(isEdit ? pool!.scope : values.scope) && (
                <GroupRangeFields pool={pool} submitting={submitting} />
              )}
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
