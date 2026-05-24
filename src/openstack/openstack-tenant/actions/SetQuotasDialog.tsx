import React, { FC, ReactNode } from 'react';
import { OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import { Field, Form, useFormState } from 'react-final-form';
import { openstackTenantsSetQuotas } from 'waldur-js-client';

import { NumberField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { QUOTA_CATEGORIES } from '@/quotas/constants';
import { Quota } from '@/quotas/types';
import { formatQuotaValue, formatQuotaName } from '@/quotas/utils';
import { ActionDialogProps } from '@/resource/actions/types';
import { renderFieldOrDash } from '@/table/utils';

import { OpenStackTenant } from '../types';

const MIB_PER_GB = 1024;

// Quotas that can be set via openstackTenantsSetQuotas
const SETTABLE_QUOTAS = new Set([
  'instances',
  'volumes',
  'snapshots',
  'ram',
  'vcpu',
  'storage',
  'security_group_count',
  'security_group_rule_count',
  // Neutron quotas (accept -1 for unlimited)
  'floating_ip_count',
  'network_count',
  'subnet_count',
  'port_count',
]);

// These quotas accept -1 (unlimited) as a valid value in addition to non-negative integers
const UNLIMITED_QUOTAS = new Set([
  'floating_ip_count',
  'network_count',
  'subnet_count',
  'port_count',
]);

// Read-only quotas that derive from another quota — shown with an explanatory tooltip
const DERIVED_QUOTA_TOOLTIPS: Record<string, string> = {
  volumes_size: translate(
    'Derived from the Storage quota; not separately settable.',
  ),
  snapshots_size: translate(
    'Derived from the Storage quota; not separately settable.',
  ),
};

// Quotas that store values in MiB and are displayed/edited in GB
const MIB_QUOTAS = new Set(['ram', 'storage']);

interface QuotaRowData {
  name: string;
  label: string;
  usage: number | undefined;
  limitMib: number | undefined; // raw value from API (MiB for ram/storage, count otherwise)
  limitDisplay: string | number; // formatted for display
  settable: boolean;
  // For settable quotas: the form field name
  fieldName?: string;
  // For settable quotas: initial value (GB for MiB-based, raw otherwise)
  initialValue?: number;
  // For settable quotas: minimum accepted value (-1 for quotas that allow unlimited)
  minValue?: number;
  // For read-only quotas: explanatory tooltip text
  tooltip?: string;
}

const formatLimit = (
  value: number | undefined,
  name: string,
): string | number => {
  if (value === undefined || value === null) return '—';
  return formatQuotaValue(value, name) ?? value;
};

const mibToGb = (mib: number | undefined): number | undefined => {
  if (mib === undefined || mib === null || mib === -1) return undefined;
  return Math.round(mib / MIB_PER_GB);
};

const makeSettableRow = (
  name: string,
  quota: Quota | undefined,
): QuotaRowData => ({
  name,
  label: formatQuotaName(name),
  usage: quota?.usage,
  limitMib: quota?.limit,
  limitDisplay: quota !== undefined ? formatLimit(quota.limit, name) : '—',
  settable: true,
  fieldName: name,
  initialValue:
    quota !== undefined
      ? MIB_QUOTAS.has(name)
        ? mibToGb(quota.limit)
        : quota.limit
      : undefined,
  minValue: UNLIMITED_QUOTAS.has(name) ? -1 : 0,
});

const makeReadOnlyRow = (quota: Quota): QuotaRowData => ({
  name: quota.name,
  label: formatQuotaName(quota.name),
  usage: quota.usage,
  limitMib: quota.limit,
  limitDisplay: formatLimit(quota.limit, quota.name),
  settable: false,
  tooltip: DERIVED_QUOTA_TOOLTIPS[quota.name],
});

// Derive ordered list of quota rows grouped by category.
// Settable quotas always appear (even when absent from resource.quotas) so the
// dialog is usable on freshly-created tenants that have no quota records yet.
const buildCategoryRows = (
  quotas: Quota[],
): Array<{ categoryLabel: string; rows: QuotaRowData[] }> => {
  const quotaByName = new Map(quotas.map((q) => [q.name, q]));
  const result: Array<{ categoryLabel: string; rows: QuotaRowData[] }> = [];

  for (const [, category] of Object.entries(QUOTA_CATEGORIES)) {
    const rows: QuotaRowData[] = [];

    // Settable members first — always present, stable order
    for (const nameOrPattern of category.names) {
      if (typeof nameOrPattern !== 'string') continue;
      if (!SETTABLE_QUOTAS.has(nameOrPattern)) continue;
      rows.push(makeSettableRow(nameOrPattern, quotaByName.get(nameOrPattern)));
    }

    // Non-settable members from resource.quotas (read-only context rows)
    for (const nameOrPattern of category.names) {
      const matchingQuotas = quotas.filter((q) => {
        if (typeof nameOrPattern === 'string') return q.name === nameOrPattern;
        return nameOrPattern.test(q.name);
      });
      for (const quota of matchingQuotas) {
        if (!SETTABLE_QUOTAS.has(quota.name)) {
          rows.push(makeReadOnlyRow(quota));
        }
      }
    }

    // Categories with settable members always appear; others only when data is present
    const hasSettable = category.names.some(
      (n) => typeof n === 'string' && SETTABLE_QUOTAS.has(n),
    );
    if (hasSettable || rows.length > 0) {
      result.push({ categoryLabel: category.label, rows });
    }
  }

  // Append any quotas not covered by QUOTA_CATEGORIES (read-only only)
  const categorizedNames = new Set(
    Object.values(QUOTA_CATEGORIES).flatMap((c) =>
      quotas
        .filter((q) =>
          c.names.some((n) =>
            typeof n === 'string' ? n === q.name : n.test(q.name),
          ),
        )
        .map((q) => q.name),
    ),
  );
  // Also exclude settable quotas already seeded above
  const uncategorized = quotas.filter(
    (q) => !categorizedNames.has(q.name) && !SETTABLE_QUOTAS.has(q.name),
  );
  if (uncategorized.length > 0) {
    result.push({
      categoryLabel: translate('Other'),
      rows: uncategorized.map(makeReadOnlyRow),
    });
  }

  return result;
};

const formatUsage = (usage: number | undefined, name: string): ReactNode => {
  if (usage === undefined || usage === null) return '—';
  return String(formatQuotaValue(usage, name) ?? usage);
};

interface QuotaTableRowProps {
  row: QuotaRowData;
}

const QuotaTableRow: FC<QuotaTableRowProps> = ({ row }) => {
  const { values } = useFormState();

  const newValueRaw: number | undefined = row.fieldName
    ? values[row.fieldName]
    : undefined;

  // Compute the difference: new limit (in same unit as limit display) minus current limit
  let difference: number | undefined;
  if (
    row.settable &&
    row.fieldName &&
    newValueRaw !== undefined &&
    newValueRaw !== null
  ) {
    if (MIB_QUOTAS.has(row.name)) {
      // Both currentLimit and newValue are in GB for display
      const currentGb = mibToGb(row.limitMib);
      if (currentGb !== undefined) {
        difference = Number(newValueRaw) - currentGb;
      }
    } else {
      const currentLimit = row.limitMib ?? 0;
      difference = Number(newValueRaw) - currentLimit;
    }
  }

  const labelCell = row.tooltip ? (
    <OverlayTrigger overlay={<Tooltip>{row.tooltip}</Tooltip>} placement="top">
      <span className="text-nowrap text-decoration-underline-dotted cursor-help">
        {row.label}
      </span>
    </OverlayTrigger>
  ) : (
    <span className="text-nowrap">{row.label}</span>
  );

  return (
    <tr>
      <td className="text-nowrap">{labelCell}</td>
      <td>{renderFieldOrDash(formatUsage(row.usage, row.name))}</td>
      <td>{renderFieldOrDash(row.limitDisplay)}</td>
      <td onClick={(e) => e.stopPropagation()}>
        {row.settable && row.fieldName ? (
          <Field
            name={row.fieldName}
            render={({ input }) => (
              <NumberField
                input={input}
                unit={MIB_QUOTAS.has(row.name) ? 'GB' : undefined}
                min={row.minValue ?? 0}
                data-testid={`quota-${row.name}`}
              />
            )}
          />
        ) : (
          <span className="text-muted">{row.limitDisplay}</span>
        )}
      </td>
      <td>
        {difference !== undefined ? (
          <ChangesAmountBadge
            changes={difference}
            unit={MIB_QUOTAS.has(row.name) ? ' GB' : ''}
            badgePill
            badgeOutline
            keepDecimals
            badgeSm
            showSign
          />
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
    </tr>
  );
};

interface SetQuotasFormValues {
  [key: string]: number | undefined;
}

export const SetQuotasDialog: FC<ActionDialogProps<OpenStackTenant>> = ({
  resolve: { resource, refetch },
}) => {
  const { quotas } = resource;
  const categoryRows = buildCategoryRows(quotas);

  // Build initialValues from all settable quotas
  const initialValues: SetQuotasFormValues = {};
  for (const { rows } of categoryRows) {
    for (const row of rows) {
      if (row.settable && row.fieldName && row.initialValue !== undefined) {
        initialValues[row.fieldName] = row.initialValue;
      }
    }
  }

  const setQuotasMutation = useManagedMutation<any, any, SetQuotasFormValues>({
    mutationFn: (formValues) => {
      const body: Record<string, number> = {};

      for (const name of SETTABLE_QUOTAS) {
        const value = formValues[name];
        if (value === undefined || value === null) continue;
        if (MIB_QUOTAS.has(name)) {
          body[name] = Math.round(Number(value) * MIB_PER_GB);
        } else {
          body[name] = Number(value);
        }
      }

      return openstackTenantsSetQuotas({
        path: { uuid: resource.uuid },
        body,
      });
    },
    successMessage: translate('Quota update has been scheduled.'),
    errorMessage: translate('Unable to update quotas.'),
    refetch: refetch ? () => refetch() : undefined,
  });

  return (
    <Form
      onSubmit={(values) => setQuotasMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change quotas')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <Card className="card-table card-bordered full-width">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <div className="table-container">
                    <table className="table table-row-bordered align-middle">
                      <thead>
                        <tr className="align-middle">
                          <th>{translate('Component')}</th>
                          <th>{translate('Usage')}</th>
                          <th>{translate('Current limit')}</th>
                          <th>{translate('New limit')}</th>
                          <th>{translate('Difference')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryRows.map(({ categoryLabel, rows }) => (
                          <React.Fragment key={categoryLabel}>
                            <tr className="table-active">
                              <td
                                colSpan={5}
                                className="fw-bold text-muted fs-7"
                              >
                                {categoryLabel}
                              </td>
                            </tr>
                            {rows.map((row) => (
                              <QuotaTableRow key={row.name} row={row} />
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </ModalDialog>
        </form>
      )}
    />
  );
};
