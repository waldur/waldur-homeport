import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { Project } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { useTitle } from '@waldur/navigation/title';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { GlobalProjectCreateButton } from '@waldur/project/create/GlobalProjectCreateButton';
import { ProjectImportButton } from '@waldur/project/import/ProjectImportButton';
import { ProjectCard } from '@waldur/project/ProjectCard';
import { ProjectEndDateField } from '@waldur/project/ProjectEndDateField';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { SLUG_COLUMN } from '@waldur/table/slug';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getUser } from '@waldur/workspace/selectors';

import { ProjectExpandableRow } from './ProjectExpandableRow';
import { ProjectsListFilter } from './ProjectsListFilter';

const mapStateToFilter = createSelector(
  getFormValues('affiliationProjectsListFilter'),
  getUser,
  (stateFilter: any, user) => {
    const filter: any = {};
    if (
      stateFilter &&
      stateFilter.organization &&
      Array.isArray(stateFilter.organization)
    ) {
      filter.customer = stateFilter.organization.map((x) => x.uuid).join(',');
    }
    if (stateFilter && stateFilter.conceal_finished_projects) {
      filter.conceal_finished_projects = stateFilter.conceal_finished_projects;
    }
    filter.user_uuid = user.uuid;
    return filter;
  },
);

export const ProjectsList = () => {
  useTitle(translate('Projects'), '', 'browser');
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'name',
    filter,
  });

  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();

  const onClickDetails = (row) =>
    syncResourceFilters({
      organization: {
        name: row.customer_name,
        uuid: row.customer_uuid,
      },
      project: row,
    });

  const columns: Column<Project>[] = [
    {
      title: translate('Name'),
      orderField: 'name',
      render: ({ row }) => (
        <ProjectLink row={row} onClick={() => onClickDetails(row)} />
      ),

      copyField: (row) => row.name,
      keys: ['name', 'is_industry'],
      id: 'name',
      export: 'name',
    },
    {
      title: translate('Organization'),
      orderField: 'customer_name',
      render: ({ row }) => (
        <OrganizationLink
          uuid={row.customer_uuid}
          onClick={() =>
            syncResourceFilters({
              organization: {
                uuid: row.customer_uuid,
                name: row.customer_name,
              },
              project: null,
            })
          }
        >
          {row.customer_name}
        </OrganizationLink>
      ),

      keys: ['customer_uuid', 'customer_name'],
      filter: 'organization',
      inlineFilter: (row) => [
        { name: row.customer_name, uuid: row.customer_uuid },
      ],

      id: 'organization',
      export: 'customer_name',
    },
    {
      title: translate('Organization abbreviation'),
      render: ({ row }) => <>{row.customer_abbreviation || DASH_ESCAPE_CODE}</>,
      optional: true,
      keys: ['customer_abbreviation'],
      id: 'organization_abbreviation',
    },
    {
      title: translate('Resources'),
      render: ({ row }) => <>{row.resources_count || 0}</>,
      keys: ['resources_count', 'marketplace_resource_count'],
      id: 'resources',
      export: (row) => row.resources_count || 0,
    },
    {
      title: translate('Start date'),
      orderField: 'start_date',
      render: ({ row }) => (
        <>{row.start_date ? formatDate(row.start_date) : DASH_ESCAPE_CODE}</>
      ),

      keys: ['start_date'],
      id: 'start_date',
      export: (row) =>
        row.start_date ? formatDate(row.start_date) : DASH_ESCAPE_CODE,
      optional: true,
    },

    {
      title: translate('End date'),
      orderField: 'end_date',
      render: ProjectEndDateField,
      keys: ['end_date'],
      id: 'end_date',
      export: (row) =>
        row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE,
    },
    {
      title: translate('Created'),
      render: ({ row }) => (
        <>{row.created ? formatDate(row.created) : DASH_ESCAPE_CODE}</>
      ),

      keys: ['created'],
      orderField: 'created',
      id: 'created',
      export: (row) => formatDateTime(row.created),
    },
    {
      title: translate('Backend ID'),
      render: ({ row }) => <>{row.backend_id || DASH_ESCAPE_CODE}</>,
      optional: true,
      keys: ['backend_id'],
      id: 'backend_id',
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      optional: true,
      keys: ['uuid'],
      id: 'uuid',
    },
    SLUG_COLUMN as Column<Project>,
  ];

  if (isFeatureVisible(ProjectFeatures.estimated_cost)) {
    columns.push({
      title: translate('Cost estimation'),
      render: ({ row }) => (
        <>
          {defaultCurrency(
            (row.billing_price_estimate && row.billing_price_estimate.total) ||
              0,
          )}
        </>
      ),

      keys: ['billing_price_estimate'],
      id: 'cost_estimation',
      export: (row) =>
        defaultCurrency(
          (row.billing_price_estimate && row.billing_price_estimate.total) || 0,
        ),
    });
  }

  if (isFeatureVisible(ProjectFeatures.oecd_fos_2007_code)) {
    columns.push({
      title: translate('OECD FoS code'),
      render: ({ row }) => (
        <>
          {row.oecd_fos_2007_code
            ? `${row.oecd_fos_2007_code}. ${row.oecd_fos_2007_label}`
            : DASH_ESCAPE_CODE}
        </>
      ),

      optional: true,
      keys: ['oecd_fos_2007_code', 'oecd_fos_2007_label'],
      id: 'oecd_fos_code',
      export: (row) =>
        row.oecd_fos_2007_code
          ? `${row.oecd_fos_2007_code}. ${row.oecd_fos_2007_label}`
          : DASH_ESCAPE_CODE,
    });
  }

  if (isFeatureVisible(ProjectFeatures.show_industry_flag)) {
    columns.push({
      title: translate('Industry project'),
      render: ({ row }) => (
        <>{row.is_industry ? translate('Yes') : translate('No')}</>
      ),

      optional: true,
      keys: ['is_industry'],
      id: 'industry_project',
      export: (row) => (row.is_industry ? translate('Yes') : translate('No')),
    });
  }

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('projects')}
      title={translate('Projects')}
      gridSize={{ md: 6, xl: 4 }}
      gridItem={({ row }) => (
        <ProjectCard project={row} onClickDetails={() => onClickDetails(row)} />
      )}
      hoverShadow={{ grid: false }}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={ProjectExpandableRow}
      filters={<ProjectsListFilter />}
      filter={filter}
      standalone
      hasOptionalColumns
      tableActions={
        <>
          <ProjectImportButton refetch={props.fetch} />
          <GlobalProjectCreateButton refetch={props.fetch} />
        </>
      }
      rowActions={({ row }) => (
        <ProjectsListActions project={row} refetch={props.fetch} />
      )}
    />
  );
};
