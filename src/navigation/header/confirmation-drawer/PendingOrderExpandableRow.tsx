import { FC, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { OrderDetails } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

/**
 * Attribute keys the tables already show as their own columns, or that the
 * Limits tab renders in a readable form. Repeating them under "User submitted
 * fields" as raw JSON would be noise.
 */
const COVERED_ATTRIBUTES = ['name', 'old_limits'];

interface KeyValueRow {
  uuid: string;
  key: string;
  previous?: string;
  value: string;
}

const formatValue = (value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value);

/**
 * Nested lists must go through `@/table/Table` so they keep the header styling,
 * sizing and empty state every other list in the app has. Rows are already in
 * hand, so `fetchData` resolves them straight away instead of hitting the API.
 */
const NestedKeyValueTable: FC<{
  table: string;
  rows: KeyValueRow[];
  keyLabel: string;
  valueLabel: string;
  hasPrevious?: boolean;
  verboseName: string;
}> = ({ table, rows, keyLabel, valueLabel, hasPrevious, verboseName }) => {
  const tableProps = useTable({
    table,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });

  return (
    <Table<KeyValueRow>
      {...tableProps}
      columns={[
        { title: keyLabel, render: ({ row }) => row.key },
        ...(hasPrevious
          ? [
              {
                title: translate('Previous'),
                render: ({ row }) => renderFieldOrDash(row.previous),
              },
            ]
          : []),
        { title: valueLabel, render: ({ row }) => row.value },
      ]}
      verboseName={verboseName}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
      minHeight="auto"
    />
  );
};

/** Tab counter, same treatment the global search popover gives its tabs. */
const TabCount: FC<{ count: number }> = ({ count }) => (
  <Badge variant="default" pill outline className="ms-2">
    {count}
  </Badge>
);

const MetadataTab: FC<{ order: OrderDetails }> = ({ order }) => (
  <>
    <Field
      label={translate('Order ID')}
      value={renderFieldOrDash(order.slug)}
    />
    <Field
      label={translate('Created by')}
      value={renderFieldOrDash(
        order.created_by_full_name || order.created_by_username,
      )}
    />
    <Field
      label={translate('Created at')}
      value={formatDateTime(order.created)}
    />
    <Field
      label={translate('Plan')}
      value={renderFieldOrDash(order.plan_name)}
    />
    {order.new_plan_name ? (
      <Field label={translate('New plan')} value={order.new_plan_name} />
    ) : null}
    {order.start_date ? (
      <Field
        label={translate('Scheduled start')}
        value={formatDateTime(order.start_date)}
      />
    ) : null}
    {order.project_description ? (
      <Field
        label={translate('Project description')}
        value={order.project_description}
      />
    ) : null}
    {order.request_comment ? (
      <Field label={translate('PO reference')} value={order.request_comment} />
    ) : null}
    {order.attachment ? (
      <Field
        label={translate('Purchase order')}
        value={
          <FileDownloader url={order.attachment} name={translate('PDF file')} />
        }
      />
    ) : null}
  </>
);

/**
 * Nested details for a row in the pending order tables — the same
 * expand-arrow pattern the full orders table uses, split into tabs so a
 * reviewer can check limits and submitted values without opening the order's
 * own page. Deliberately leaves out offering, resource, organization, project,
 * type and state: those are already columns of the row being expanded.
 */
export const PendingOrderExpandableRow: FC<{ row: OrderDetails }> = ({
  row: order,
}) => {
  const [activeTab, setActiveTab] = useState('metadata');

  const attributes = (order.attributes ?? {}) as Record<string, unknown>;
  const oldLimits = (attributes.old_limits ?? null) as Record<
    string,
    unknown
  > | null;

  const limitRows = useMemo<KeyValueRow[]>(() => {
    const limits = (order.limits ?? {}) as Record<string, unknown>;
    return Object.entries(limits).map(([key, value]) => ({
      uuid: key,
      key,
      previous:
        oldLimits?.[key] != null ? formatValue(oldLimits[key]) : undefined,
      value: formatValue(value),
    }));
  }, [order.limits, oldLimits]);

  const attributeRows = useMemo<KeyValueRow[]>(
    () =>
      Object.entries(attributes)
        .filter(([key]) => !COVERED_ATTRIBUTES.includes(key))
        .map(([key, value]) => ({
          uuid: key,
          key,
          value: formatValue(value),
        })),
    [order.attributes],
  );

  return (
    // `fluid`: the default expandable row sizes itself with viewport
    // arithmetic (100vw minus the aside), which assumes a full-page table. In
    // the drawer that is far wider than the panel, so the nested tables spill
    // past its edge. `fluid` makes it take the width it is actually given, and
    // the tables shrink with the panel instead.
    <ExpandableContainer className="fluid">
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap mb-4">
          {/* d-flex on the item + align-items-center on the link: a tab
              carrying a count badge is taller than a bare label, so without
              this its underline sits lower than Metadata's. */}
          <Nav.Item className="d-flex">
            <Nav.Link eventKey="metadata" className="d-flex align-items-center">
              {translate('Metadata')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="d-flex">
            <Nav.Link eventKey="limits" className="d-flex align-items-center">
              {translate('Limits')}
              <TabCount count={limitRows.length} />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="d-flex">
            <Nav.Link
              eventKey="attributes"
              className="d-flex align-items-center"
            >
              {translate('User submitted fields')}
              <TabCount count={attributeRows.length} />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="metadata" unmountOnExit>
            <MetadataTab order={order} />
          </Tab.Pane>
          <Tab.Pane eventKey="limits" unmountOnExit>
            <NestedKeyValueTable
              table={`pending-order-limits-${order.uuid}`}
              rows={limitRows}
              keyLabel={translate('Component')}
              valueLabel={translate('Limit')}
              hasPrevious={Boolean(oldLimits)}
              verboseName={translate('limits')}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="attributes" unmountOnExit>
            <NestedKeyValueTable
              table={`pending-order-attributes-${order.uuid}`}
              rows={attributeRows}
              keyLabel={translate('Field')}
              valueLabel={translate('Value')}
              verboseName={translate('fields')}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </ExpandableContainer>
  );
};
