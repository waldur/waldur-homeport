import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { marketplaceResourcesList, Resource } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ComponentMap } from './types';

interface OrganizationResourcesTableProps {
  customerUuid: string;
  componentTypes?: string[];
  componentMap?: ComponentMap;
}

// Format UUID without dashes (as per Grafana dashboard spec)
const formatUuidNoDashes = (uuid: string | undefined): string => {
  if (!uuid) return '—';
  return uuid.replace(/-/g, '');
};

// Format numeric value with fallback
const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return '—';
  return value.toLocaleString();
};

// Get display label for a component type
const getComponentLabel = (
  type: string,
  componentMap?: ComponentMap,
): string => {
  if (componentMap?.[type]?.name) return componentMap[type].name;
  // Fallback: convert snake_case to Title Case
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Boolean indicator component
const BooleanIndicator: FC<{ value: boolean | undefined; label?: string }> = ({
  value,
  label,
}) => {
  if (value === undefined || value === null) return <span>—</span>;
  return value ? (
    <Tip id={`bool-${label}`} label={label || translate('Yes')}>
      <CheckIcon size={16} weight="bold" className="text-success" />
    </Tip>
  ) : (
    <Tip id={`bool-${label}`} label={label || translate('No')}>
      <XIcon size={16} weight="bold" className="text-muted" />
    </Tip>
  );
};

// Array values badges component (for options like used_ai_tech)
const ArrayBadges: FC<{ values: unknown }> = ({ values }) => {
  if (!values || !Array.isArray(values) || values.length === 0)
    return <span>—</span>;
  return (
    <div className="d-flex flex-wrap gap-1">
      {values.map((item, index) => (
        <Badge key={index} variant="primary" size="sm" outline>
          {String(item)}
        </Badge>
      ))}
    </div>
  );
};

// Render an option value based on its type
const OptionValue: FC<{ value: unknown; optionKey: string }> = ({
  value,
  optionKey,
}) => {
  if (value === undefined || value === null) return <span>—</span>;
  if (typeof value === 'boolean') {
    return <BooleanIndicator value={value} label={optionKey} />;
  }
  if (Array.isArray(value)) {
    return <ArrayBadges values={value} />;
  }
  return <span>{String(value)}</span>;
};

// Parse options that might be JSON strings
const parseOptions = (
  options: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  if (!options) return {};
  const parsed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(options)) {
    if (typeof value === 'string') {
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  }
  return parsed;
};

// Collect all unique component types from resources
const collectComponentTypes = (resources: Resource[]): string[] => {
  const types = new Set<string>();
  for (const resource of resources) {
    if (resource.limits) {
      for (const type of Object.keys(resource.limits)) {
        types.add(type);
      }
    }
    if (resource.current_usages) {
      for (const type of Object.keys(resource.current_usages)) {
        types.add(type);
      }
    }
  }
  return Array.from(types).sort();
};

// Collect all unique option keys from resources
const collectOptionKeys = (resources: Resource[]): string[] => {
  const keys = new Set<string>();
  for (const resource of resources) {
    const options = resource.options as Record<string, unknown> | undefined;
    if (options) {
      for (const key of Object.keys(options)) {
        keys.add(key);
      }
    }
  }
  return Array.from(keys).sort();
};

export const OrganizationResourcesTable: FC<
  OrganizationResourcesTableProps
> = ({ customerUuid, componentMap }) => {
  const filter = useMemo(
    () => ({
      customer_uuid: customerUuid,
      // Exclude terminated
      state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
      field: [
        'uuid',
        'name',
        'project_uuid',
        'project_name',
        'limits',
        'current_usages',
        'options',
        'created',
        'backend_id',
        'state',
        'project_end_date',
        'offering_name',
        'offering_uuid',
        'customer_uuid',
        'customer_name',
      ],
    }),
    [customerUuid],
  );

  const tableProps = useTable({
    table: 'OrganizationResourcesTable',
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
  });

  // Collect component types and option keys from current page of resources
  const componentTypes = useMemo(
    () => collectComponentTypes(tableProps.rows as Resource[]),
    [tableProps.rows],
  );

  const optionKeys = useMemo(
    () => collectOptionKeys(tableProps.rows as Resource[]),
    [tableProps.rows],
  );

  const columns: Column<Resource>[] = useMemo(() => {
    const baseColumns: Column<Resource>[] = [
      {
        title: translate('Project'),
        render: ({ row }) => (
          <div className="py-3">
            <Link state="project.dashboard" params={{ uuid: row.project_uuid }}>
              {renderFieldOrDash(row.project_name)}
            </Link>
            <div className="d-flex align-items-center text-muted fs-8 mt-1">
              <span className="text-truncate" style={{ maxWidth: '150px' }}>
                {formatUuidNoDashes(row.project_uuid)}
              </span>
              {row.project_uuid && (
                <CopyToClipboardButton
                  value={formatUuidNoDashes(row.project_uuid)}
                  size={12}
                  className="ms-1"
                />
              )}
            </div>
          </div>
        ),
        orderField: 'project_name',
      },
      {
        title: translate('Resource'),
        render: ({ row }) => (
          <div>
            <Link
              state="marketplace-public-resource-details"
              params={{ resource_uuid: row.uuid }}
            >
              {renderFieldOrDash(row.name || row.offering_name)}
            </Link>
            <div className="d-flex align-items-center text-muted fs-8 mt-1">
              <span className="text-truncate" style={{ maxWidth: '150px' }}>
                {formatUuidNoDashes(row.uuid)}
              </span>
              {row.uuid && (
                <CopyToClipboardButton
                  value={formatUuidNoDashes(row.uuid)}
                  size={12}
                  className="ms-1"
                />
              )}
            </div>
          </div>
        ),
        orderField: 'name',
      },
    ];

    // Generate dynamic limit columns for each component type
    const limitColumns: Column<Resource>[] = componentTypes.map((type) => ({
      title: `${getComponentLabel(type, componentMap)} ${translate('Limit')}`,
      render: ({ row }) => {
        const limits = row.limits || {};
        return formatNumber(limits[type]);
      },
      export: (row) => {
        const limits = row.limits || {};
        return limits[type];
      },
    }));

    // Generate dynamic usage columns for each component type
    const usageColumns: Column<Resource>[] = componentTypes.map((type) => ({
      title: `${getComponentLabel(type, componentMap)} ${translate('Usage')}`,
      render: ({ row }) => {
        const usages = row.current_usages || {};
        const usage = usages[type];
        return formatNumber(usage);
      },
      export: (row) => {
        const usages = row.current_usages || {};
        return usages[type];
      },
    }));

    const metadataColumns: Column<Resource>[] = [
      {
        title: translate('State'),
        render: ({ row }) => <ResourceStateField resource={row} pill outline />,
        orderField: 'state',
      },
      {
        title: translate('Created'),
        render: ({ row }) => renderFieldOrDash(formatDateTime(row.created)),
        orderField: 'created',
      },
      {
        title: translate('Project End Date'),
        render: ({ row }) =>
          renderFieldOrDash(
            row.project_end_date ? formatDate(row.project_end_date) : null,
          ),
        orderField: 'project_end_date',
      },
      {
        title: translate('Backend ID'),
        render: ({ row }) => renderFieldOrDash(row.backend_id),
      },
    ];

    // Generate dynamic option columns
    const optionColumns: Column<Resource>[] = optionKeys.map((key) => ({
      title: key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      render: ({ row }) => {
        const options = row.options as Record<string, unknown> | undefined;
        const parsed = parseOptions(options);
        return <OptionValue value={parsed[key]} optionKey={key} />;
      },
      export: (row): string | number => {
        const options = row.options as Record<string, unknown> | undefined;
        const parsed = parseOptions(options);
        const value = parsed[key];
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'boolean')
          return value ? translate('Yes') : translate('No');
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value;
        return String(value ?? '');
      },
    }));

    return [
      ...baseColumns,
      ...limitColumns,
      ...usageColumns,
      ...metadataColumns,
      ...optionColumns,
    ];
  }, [componentTypes, componentMap, optionKeys]);

  return (
    <Table<Resource>
      {...tableProps}
      columns={columns}
      verboseName={translate('resources')}
      title={translate('Organization resources')}
      showPageSizeSelector
      initialSorting={{ field: 'created', mode: 'asc' }}
      enableExport
    />
  );
};
