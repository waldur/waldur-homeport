import { FC } from 'react';
import { Customer, Project } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ResourceImportButton } from '@/marketplace/resources/import/ResourceImportButton';
import { ResourceMultiSelectAction } from '@/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import Table from '@/table/Table';
import { TableProps } from '@/table/types';
import { useCustomer, useProject } from '@/workspace/hooks';

import { CreateResourceButton } from './CreateResourceButton';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ProjectResourcesAllFilter } from './ProjectResourcesAllFilter';
import { ResourceActionsButton } from './ResourceActionsButton';
import { getResourceAllListColumns } from './utils';

interface ResourcesAllListTableProps extends TableProps {
  hasProjectColumn?: boolean;
  hasCustomerColumn?: boolean;
  context?: 'organization' | 'project';
  customer?: Customer;
  project?: Project;
}

const AddResourceButton = ({
  context,
  customer,
  project,
}: Pick<ResourcesAllListTableProps, 'context' | 'customer' | 'project'>) => {
  return (
    <CreateResourceButton
      organization={context ? customer : undefined}
      project={context === 'project' ? project : undefined}
    />
  );
};

export const ResourcesAllListTable: FC<ResourcesAllListTableProps> = (
  props,
) => {
  const customer = useCustomer();
  const project = useProject();
  return (
    <Table
      {...props}
      filters={
        <ProjectResourcesAllFilter
          hasProjectFilter={props.hasProjectColumn}
          hasCustomerFilter={props.hasCustomerColumn}
          customer={customer}
          project={project}
        />
      }
      columns={getResourceAllListColumns(
        props.hasCustomerColumn,
        props.hasProjectColumn,
      )}
      hasOptionalColumns
      title={translate('Resources')}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      rowActions={
        !project?.is_removed
          ? ({ row }) => (
              <ResourceActionsButton row={row} refetch={props.fetch} />
            )
          : undefined
      }
      hasQuery={true}
      enableExport
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={!project?.is_removed}
      multiSelectActions={
        !project?.is_removed ? ResourceMultiSelectAction : undefined
      }
      tableActions={
        !project?.is_removed ? (
          <>
            {isFeatureVisible(MarketplaceFeatures.import_resources) && (
              <ResourceImportButton />
            )}
            <AddResourceButton
              context={props.context}
              customer={customer}
              project={project}
            />
          </>
        ) : null
      }
    />
  );
};
