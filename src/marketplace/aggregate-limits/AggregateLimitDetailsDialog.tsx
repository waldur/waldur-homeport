import { useEffect, useState } from 'react';
import {
  ComponentsUsageStats,
  Customer,
  marketplaceResourcesList,
  MarketplaceResourcesListData,
  Project,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { NON_TERMINATED_STATES } from '../resources/list/constants';
import { PublicResourceLink } from '../resources/list/PublicResourceLink';

import { AggregateLimitsExpandableRow } from './AggregateLimitsExpandableRow';
import { getComponentKey, getComponentDisplayName } from './utils';

const requiredFields: MarketplaceResourcesListData['query']['field'] = [
  'name',
  'current_usages',
  'limits',
  'uuid',
  'limit_usage',
];

export const AggregateLimitDetailsDialog = ({
  resolve: { project, customer, components },
}: {
  resolve: {
    project?: Project;
    customer?: Customer;
    components: ComponentsUsageStats['components'];
  };
}) => {
  const { showErrorResponse } = useNotify();
  const initialComponent = components?.[0] || null;
  const [selectedComponentType, setSelectedComponentType] =
    useState(initialComponent);
  const [allRows, setAllRows] = useState([]);

  const fetchData = async (component) => {
    if (!component) return;

    try {
      const response = await getAllPages((page) =>
        marketplaceResourcesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            project_uuid: project?.uuid,
            customer_uuid: customer?.uuid,
            state: NON_TERMINATED_STATES,
            field: requiredFields,
            offering_uuid: component.offering_uuid,
          },
        }),
      );
      setAllRows(response || []);
    } catch (error) {
      showErrorResponse(error, translate('Unable to load resource data.'));
    }
  };

  useEffect(() => {
    fetchData(selectedComponentType);
  }, [project, customer, selectedComponentType]);

  const handleChange = (value) => {
    const selected = components.find(
      (component) => getComponentKey(component) === value.value,
    );
    setSelectedComponentType(selected || null);
  };

  const getComponentOptions = () => {
    if (!components) return [];

    return components.map((component) => ({
      value: getComponentKey(component),
      label: getComponentDisplayName(component, components),
    }));
  };

  const tableProps = useTable({
    table: 'aggregateLimitDetailsDialog',
    fetchData: () =>
      Promise.resolve({
        rows: allRows,
        resultCount: allRows.length,
      }),
  });

  const columns = [
    {
      title: translate('Name'),
      render: PublicResourceLink,
      copyField: (row) => row.name,
    },
    selectedComponentType.billing_type === 'limit'
      ? {
          title: translate('Limit usage'),
          render: ({ row }) =>
            row.limit_usage?.[selectedComponentType?.type] || DASH_ESCAPE_CODE,
        }
      : {
          title: translate('Usage'),
          render: ({ row }) =>
            row.current_usages?.[selectedComponentType?.type] ||
            DASH_ESCAPE_CODE,
        },
    {
      title: translate('Limit'),
      render: ({ row }) =>
        row.limits?.[selectedComponentType?.type] || DASH_ESCAPE_CODE,
    },
  ];

  const renderExpandableRow = () => {
    const componentData = components.find(
      (component) => component.type === selectedComponentType?.type,
    );
    return <AggregateLimitsExpandableRow data={componentData || {}} />;
  };

  return (
    <ModalDialog
      title={translate('Usage and limits details for {object}', {
        object: project?.name || customer.name,
      })}
    >
      <div className="row d-flex justify-content-end">
        <div className="col-md-4">
          <Select
            placeholder={translate('Select component')}
            className="mb-2 w-100"
            value={
              selectedComponentType
                ? {
                    value: getComponentKey(selectedComponentType),
                    label: getComponentDisplayName(
                      selectedComponentType,
                      components,
                    ),
                  }
                : null
            }
            onChange={handleChange}
            options={getComponentOptions()}
            isClearable={false}
          />
        </div>
      </div>

      <Table
        {...tableProps}
        rows={allRows}
        columns={columns}
        verboseName={translate('Resources')}
        expandableRow={renderExpandableRow}
      />
    </ModalDialog>
  );
};
