import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import {
  CallOfferingComponent,
  RequestableComponent,
  RequestedOffering,
  proposalProtectedCallsOfferingComponentsDestroy,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { formatAmount, formatComponentUnit } from '@/proposals/budgets';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Call } from '../../types';

const ComponentRuleDialog = lazyComponent(() =>
  import('./ComponentRuleDialog').then((module) => ({
    default: module.ComponentRuleDialog,
  })),
);

export interface ComponentRuleRow {
  component: RequestableComponent;
  rule?: CallOfferingComponent;
}

/** The component rules of a call offering, one row per component a rule can
 * be set for: billed by its limit and priced by the call's plan. */
export const getComponentRuleRows = (
  offering: Pick<
    RequestedOffering,
    'requestable_components' | 'component_rules'
  >,
): ComponentRuleRow[] =>
  (offering.requestable_components ?? []).map((component) => ({
    component,
    rule: (offering.component_rules ?? []).find(
      (rule) => rule.component_type === component.type,
    ),
  }));

/** Why the rules of the offering cannot change, or undefined when they can. */
export const getRulesLockReason = (
  offering: Pick<RequestedOffering, 'rules_locked'>,
  readOnlyReason?: string,
) =>
  readOnlyReason ||
  (offering.rules_locked
    ? translate(
        'A submitted proposal requests this offering, so its rules no longer change.',
      )
    : undefined);

const formatRange = (row: ComponentRuleRow) => {
  const { rule, component } = row;
  if (!rule) {
    return translate('Any amount');
  }
  if (rule.is_fixed) {
    return translate('Fixed at {amount}', {
      amount: formatAmount(rule.default_amount, component.measured_unit),
    });
  }
  return `${renderFieldOrDash(formatAmount(rule.min_per_proposal))} – ${renderFieldOrDash(
    formatAmount(rule.max_per_proposal),
  )}`;
};

const RuleActions: FC<{
  row: ComponentRuleRow;
  call: Call;
  offering: RequestedOffering;
  refetch(): void;
  lockReason?: string;
}> = ({ row, call, offering, refetch, lockReason }) => {
  const { openDialog } = useModal();
  const edit = useCallback(
    () =>
      openDialog(ComponentRuleDialog, {
        resolve: {
          call,
          requestedOfferingUuid: offering.uuid,
          offeringName: offering.offering_name,
          component: row.component,
          rule: row.rule,
          refetch,
        },
        size: 'md',
      }),
    [openDialog, call, offering, row, refetch],
  );
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsOfferingComponentsDestroy({
        path: { uuid: call.uuid, obj_uuid: row.rule.uuid },
      }),
    refetch,
    confirmation: {
      title: translate('Remove rule'),
      body: translate(
        'Remove the rule of {component}? Proposals may then request any amount of it.',
        { component: row.component.name || row.component.type },
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('The component rule has been removed.'),
    errorMessage: translate('Unable to remove the component rule.'),
  });
  if (lockReason) {
    return <ActionsDropdown disabled tooltip={lockReason} />;
  }
  return (
    <ActionsDropdown>
      <ActionItem
        title={row.rule ? translate('Edit rule') : translate('Set rule')}
        action={edit}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      {row.rule ? (
        <RemovalActionItem
          title={translate('Remove rule')}
          action={mutate}
          disabled={isPending}
        />
      ) : null}
    </ActionsDropdown>
  );
};

interface CallOfferingComponentRulesProps {
  offering: RequestedOffering;
  call: Call;
  refetch(): void;
  readOnlyReason?: string;
}

/**
 * What a proposal may request of each component of the offering: the only
 * place a call bounds a request. The resource pools of the call are set on
 * these rows.
 */
export const CallOfferingComponentRules: FC<
  CallOfferingComponentRulesProps
> = ({ offering, call, refetch, readOnlyReason }) => {
  const rows = useMemo(() => getComponentRuleRows(offering), [offering]);
  const fetchData = useCallback(
    () => Promise.resolve({ rows, resultCount: rows.length }),
    [rows],
  );
  const tableProps = useTable({
    table: `CallOfferingComponentRules-${offering.uuid}`,
    fetchData,
  });
  const lockReason = getRulesLockReason(offering, readOnlyReason);

  const columns: Column<ComponentRuleRow>[] = [
    {
      title: translate('Component'),
      render: ({ row }) => (
        <>
          <span className="font-medium text-primary">
            {row.component.name || row.component.type}
          </span>
          <div className="text-quaternary">
            {formatComponentUnit(
              row.component.measured_unit,
              row.component.limit_period,
            ) || translate('units')}
          </div>
        </>
      ),
    },
    {
      title: translate('Per proposal'),
      render: ({ row }) => <>{formatRange(row)}</>,
    },
    {
      title: translate('Default'),
      render: ({ row }) => (
        <>
          {row.rule && !row.rule.is_fixed
            ? renderFieldOrDash(
                formatAmount(
                  row.rule.default_amount,
                  row.component.measured_unit,
                ),
              )
            : renderFieldOrDash(null)}
        </>
      ),
    },
  ];

  return (
    <div data-testid="component-rules">
      <p className="font-medium mb-1">
        {translate('What a proposal may request')}
      </p>
      <p className="text-quaternary mb-2.5">
        {lockReason ??
          translate(
            'Editable until a proposal requesting this offering is submitted. What the call awards of each component is set under Manage, Resource pools.',
          )}
      </p>
      <Table<ComponentRuleRow>
        {...tableProps}
        // A few rows, nested: no room kept for a full page of them.
        minHeight="auto"
        columns={columns}
        verboseName={translate('components')}
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
        rowActions={({ row }) => (
          <RuleActions
            row={row}
            call={call}
            offering={offering}
            refetch={refetch}
            lockReason={lockReason}
          />
        )}
      />
    </div>
  );
};
