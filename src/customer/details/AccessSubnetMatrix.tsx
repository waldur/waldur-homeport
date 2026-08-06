import { LockIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  AccessSubnet,
  accessSubnetsList,
  accessSubnetsPartialUpdate,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { Tip } from '@/core/Tooltip';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { createFetcher } from '@/table/api';
import {
  AccessSubnetsFilter,
  AccessSubnetsFilterFormId,
  selectAccessSubnetsFilter,
} from '@/table/generated/AccessSubnetsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { AccessSubnetRowActions } from './AccessSubnetRowActions';
import { AccessSubnetTableActions } from './AccessSubnetTableActions';
import { ProviderDefaultSubnets } from './ProviderDefaultSubnets';

/** The portal target is not an offering, so it needs a key of its own. */
const PORTAL = 'portal';

interface Target {
  key: string;
  label: string;
  /**
   * The organization no longer runs anything on this offering. The scope is
   * kept so re-provisioning restores protection, but it can only be removed
   * from here — the backend refuses to add a scope without a live resource.
   */
  dormant?: boolean;
}

interface AccessSubnetMatrixProps {
  customer: any;
  canManage: boolean;
}

export const AccessSubnetMatrix: FC<AccessSubnetMatrixProps> = ({
  customer,
  canManage,
}) => {
  const customer_uuid = customer.uuid;
  // Column filters live in Redux under the generated form id, so the table
  // reads them from there rather than holding them itself.
  const filterValues = useFilterValues(AccessSubnetsFilterFormId);
  const filter = useMemo(
    () => ({
      customer_uuid,
      ...selectAccessSubnetsFilter(filterValues as any),
    }),
    [customer_uuid, filterValues],
  );
  const tableProps = useTable({
    table: AccessSubnetsFilterFormId,
    filter,
    fetchData: createFetcher(accessSubnetsList),
    queryField: 'description',
  });

  // One column per thing the organization could trust an address for. Offerings
  // it does not consume are omitted: the backend would reject them anyway.
  //
  // The *public* endpoint, not the provider one: marketplace-provider-offerings
  // is scoped to offerings the caller publishes, so it returns nothing to a
  // consumer. Reading it here left an organization owner with no offering
  // columns at all — only already-scoped ones, shown as dormant and therefore
  // un-tickable.
  const { data: offeringsData } = useQuery({
    queryKey: ['consumed-offerings', customer_uuid],
    queryFn: () =>
      marketplacePublicOfferingsList({
        query: {
          consumer_customer_uuid: customer_uuid,
          field: ['name', 'uuid', 'default_access_subnets'],
          page_size: 200,
        },
      }),
  });
  const rows: AccessSubnet[] = tableProps.rows ?? [];

  const targets: Target[] = useMemo(() => {
    const consumed = (offeringsData?.data ?? []).map((offering) => ({
      key: offering.uuid,
      label: offering.name,
    }));
    const known = new Set(consumed.map((target) => target.key));
    // An offering the organization has stopped using is absent from the list
    // above, so without this its scope would be invisible — and therefore
    // impossible to remove, since there is no column to untick.
    const dormant: Target[] = [];
    for (const row of rows) {
      for (const scope of row.scoped_offerings ?? []) {
        if (!known.has(scope.uuid)) {
          known.add(scope.uuid);
          dormant.push({
            key: scope.uuid,
            label: scope.name,
            dormant: true,
          });
        }
      }
    }
    return [
      { key: PORTAL, label: ENV.plugins.WALDUR_CORE.SITE_NAME },
      ...consumed,
      ...dormant,
    ];
  }, [offeringsData, rows]);

  const { showSuccess, showErrorResponse } = useNotify();
  const { confirm } = useModal();
  // Which cell is mid-flight, so only that checkbox goes inert rather than the
  // whole grid freezing on every click.
  const [pendingCell, setPendingCell] = useState<string | null>(null);

  const { mutateAsync: saveScope } = useMutation({
    mutationFn: (variables: {
      uuid: string;
      applies_to_portal: boolean;
      offerings: string[];
    }) =>
      accessSubnetsPartialUpdate({
        path: { uuid: variables.uuid },
        body: {
          applies_to_portal: variables.applies_to_portal,
          offerings: variables.offerings,
        } as any,
      }),
  });

  const isChecked = (row: AccessSubnet, targetKey: string) =>
    targetKey === PORTAL
      ? Boolean(row.applies_to_portal)
      : (row.offerings ?? []).includes(targetKey);

  // Staff-pinned entries stay visible but not editable, so a consumer can still
  // see why an address is allowed without being able to change it.
  const isLocked = (row: AccessSubnet) => row.is_staff_managed;

  const toggle = async (row: AccessSubnet, target: Target) => {
    const enabling = !isChecked(row, target.key);
    const next = {
      uuid: row.uuid,
      applies_to_portal:
        target.key === PORTAL ? enabling : Boolean(row.applies_to_portal),
      offerings:
        target.key === PORTAL
          ? [...(row.offerings ?? [])]
          : enabling
            ? [...(row.offerings ?? []), target.key]
            : (row.offerings ?? []).filter((key) => key !== target.key),
    };

    // Enabling the portal target is the one change that can lock an
    // organization out of the portal, so it says so rather than relying on the
    // user knowing what the column means.
    const warning =
      target.key === PORTAL && enabling
        ? translate(
            'Once any address is listed for {site}, only listed addresses can sign in on behalf of this organization.',
            { site: ENV.plugins.WALDUR_CORE.SITE_NAME },
          )
        : null;

    try {
      await confirm(
        enabling
          ? translate('Apply to {target}?', { target: target.label })
          : translate('Stop applying to {target}?', { target: target.label }),
        <>
          <p className="mb-0">
            {enabling
              ? translate('{inet} will apply to {target}.', {
                  inet: row.inet,
                  target: target.label,
                })
              : translate('{inet} will no longer apply to {target}.', {
                  inet: row.inet,
                  target: target.label,
                })}
          </p>
          {warning && <p className="text-warning mt-2 mb-0">{warning}</p>}
        </>,
      );
    } catch {
      // Dismissed: leave the checkbox exactly as it was.
      return;
    }

    const cell = `${row.uuid}:${target.key}`;
    setPendingCell(cell);
    try {
      await saveScope(next);
      showSuccess(translate('Access subnet has been updated.'));
      tableProps.fetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to update access subnet.'));
    } finally {
      setPendingCell(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: translate('IP'),
        orderField: 'inet',
        render: ({ row }) => (
          <span className="text-nowrap">
            {row.inet}
            {isLocked(row) && (
              <Tip
                id={`staff-managed-${row.uuid}`}
                label={translate('Added by staff. It cannot be changed here.')}
                className="ms-2"
              >
                <LockIcon size={14} weight="bold" className="text-muted" />
              </Tip>
            )}
          </span>
        ),
      },
      ...targets.map((target) => ({
        title: target.dormant ? (
          <Tip
            id={`dormant-${target.key}`}
            label={translate(
              'This organization no longer has resources of {offering}. Existing entries still apply if it is used again, and can be removed here.',
              { offering: target.label },
            )}
          >
            <span className="text-muted text-decoration-underline-dotted">
              {target.label}
            </span>
          </Tip>
        ) : (
          target.label
        ),
        className: 'text-center',
        // The offering identity is part of the sort key, since "applies to
        // offering X" is a row in a separate table rather than a field; the
        // backend resolves this form into an annotation.
        orderField:
          target.key === PORTAL
            ? 'applies_to_portal'
            : `offering:${target.key}`,
        render: ({ row }) => (
          // Composed rather than the shorthand <Form.Check type="checkbox" />:
          // the shorthand's .form-check wrapper adds 1.5em of left padding and
          // pulls the input back by the same amount, which in a centred cell
          // puts the box over the edge and clips it. Dropping that padding and
          // the input's float centres it cleanly.
          <Form.Check className="d-flex justify-content-center ps-0 mb-0">
            <Form.Check.Input
              type="checkbox"
              className="float-none m-0"
              aria-label={`${row.inet} — ${target.label}`}
              checked={isChecked(row, target.key)}
              disabled={
                !canManage ||
                isLocked(row) ||
                pendingCell === `${row.uuid}:${target.key}` ||
                // Dormant scopes can be removed but not added back: the
                // organization has no live resource of the offering, which the
                // backend requires before accepting a new scope.
                (target.dormant && !isChecked(row, target.key))
              }
              onChange={() => toggle(row, target)}
            />
          </Form.Check>
        ),
      })),
      {
        title: translate('Description'),
        orderField: 'description',
        render: ({ row }) => <>{row.description}</>,
      },
    ],
    [targets, canManage, pendingCell],
  );

  return (
    <>
      <Table<AccessSubnet>
        {...tableProps}
        id="access-control-subnets"
        title={translate('Subnets')}
        columns={columns}
        verboseName={translate('subnets')}
        hasQuery
        filters={<AccessSubnetsFilter />}
        cardBordered={false}
        tableActions={
          <>
            <FilteredEventsButton
              filter={{ customer_uuid, feature: 'access_subnets' }}
            />
            <AccessSubnetTableActions
              customerUrl={customer.url}
              customerUuid={customer_uuid}
              canManage={canManage}
              refetch={tableProps.fetch}
            />
          </>
        }
        rowActions={({ row }) => (
          <AccessSubnetRowActions
            row={row}
            refetch={tableProps.fetch}
            customerUuid={customer_uuid}
          />
        )}
      />
      <ProviderDefaultSubnets offerings={offeringsData?.data ?? []} />
    </>
  );
};
