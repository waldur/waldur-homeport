import {
  EnvelopeSimpleIcon,
  PencilSimpleIcon,
  PaintBrushIcon,
} from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { WorkflowDescription, WorkflowDescriptionRule } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { recipientLabel, triggerLabel } from './labels';
import { useOpenMailDialog } from './useOpenMailDialog';

interface Row extends WorkflowDescriptionRule {
  id: string;
}

interface SectionProps {
  callUuid: string;
  stepKey: string;
  stepName: string;
  description?: WorkflowDescription;
}

/**
 * The mail the step sends, by its notification rules, in the step dialog:
 * each opens the mail dialog -- its preview, its rule, the call's wording.
 * Opening one leaves the step dialog, so unsaved changes keep it closed.
 * Nothing is shown before the call's description is in.
 */
export const StepMailsSection: FC<SectionProps> = (props) => {
  const { description, stepKey } = props;
  const rows = useMemo<Row[]>(
    () =>
      (
        description?.steps.find((step) => step.key === stepKey)
          ?.notifications ?? []
      ).map((rule, index) => ({ ...rule, id: String(index) })),
    [description, stepKey],
  );
  return rows.length ? <StepMailsTable {...props} rows={rows} /> : null;
};

const StepMailsTable: FC<SectionProps & { rows: Row[] }> = ({
  callUuid,
  stepKey,
  stepName,
  rows,
}) => {
  const { dirty } = useFormState({ subscription: { dirty: true } });
  const openMail = useOpenMailDialog(callUuid);
  const tableProps = useTable<Row>({
    table: `StepMails-${stepKey}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });
  const reason = dirty
    ? translate('Save the step first: the mail opens in place of this dialog.')
    : undefined;
  const open = (row: Row, tab?: 'preview' | 'rule' | 'customise') =>
    openMail(
      {
        step: stepKey,
        stepName,
        trigger: row.trigger,
        recipient: row.recipient,
        daysBefore: row.days_before,
      },
      tab,
    );
  const columns: Column<Row>[] = [
    {
      title: translate('Event'),
      render: ({ row }) => <>{triggerLabel(row.trigger, row.days_before)}</>,
    },
    {
      title: translate('Audience'),
      render: ({ row }) => (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {recipientLabel(row.recipient)}
          {row.proposal_role ? ` (${row.proposal_role})` : ''}
          {!row.enabled && (
            <Badge variant="neutral" size="sm" shape="pill" tone="outline">
              {translate('Disabled')}
            </Badge>
          )}
          {row.customised && (
            <Badge variant="primary" size="sm" shape="pill" tone="outline">
              {translate('Customized')}
            </Badge>
          )}
        </span>
      ),
    },
  ];
  return (
    <section data-testid="step-check-mails">
      <h6 className="mb-1">{translate('Notifications')}</h6>
      <p className="text-quaternary text-xs mb-1.5">
        {translate(
          'The mail this step sends: see it as it would be sent, change its rule, or word it for this call.',
        )}
      </p>
      <Table<Row>
        {...tableProps}
        // A few rows, nested: no room kept for a full page of them.
        minHeight="auto"
        rows={rows}
        columns={columns}
        rowKey="id"
        hideTitle
        verboseName={translate('notification rules')}
        hasActionBar={false}
        hasPagination={false}
        placeholderHasRetry={false}
        rowActions={({ row }) => (
          <ActionsDropdown row={row}>
            <ActionItem
              title={translate('See the mail')}
              action={() => open(row)}
              iconNode={<EnvelopeSimpleIcon weight="bold" />}
              disabled={Boolean(reason)}
              tooltip={reason}
            />
            <ActionItem
              title={translate('Edit the rule')}
              action={() => open(row, 'rule')}
              iconNode={<PencilSimpleIcon weight="bold" />}
              disabled={Boolean(reason)}
              tooltip={reason}
            />
            <ActionItem
              title={translate('Customize for this call')}
              action={() => open(row, 'customise')}
              iconNode={<PaintBrushIcon weight="bold" />}
              disabled={Boolean(reason)}
              tooltip={reason}
            />
          </ActionsDropdown>
        )}
      />
    </section>
  );
};
