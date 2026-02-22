import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { Project, projectsList } from 'waldur-js-client';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures, ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { useTitle } from '@waldur/navigation/title';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { GlobalProjectCreateButton } from '@waldur/project/create/GlobalProjectCreateButton';
import { ProjectImportButton } from '@waldur/project/import/ProjectImportButton';
import { ProjectCard } from '@waldur/project/ProjectCard';
import { ProjectEndDateField } from '@waldur/project/ProjectEndDateField';
import { ProjectKindField } from '@waldur/project/ProjectKindField';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { SLUG_COLUMN } from '@waldur/table/slug';
import Table from '@waldur/table/Table';
import { Column, DisplayMode } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getUser } from '@waldur/workspace/selectors';

import { ProjectExpandableRow } from './ProjectExpandableRow';
import { ProjectsListFilter } from './ProjectsListFilter';

const FILTER_FORM_ID = 'affiliationProjectsListFilter';

const mapStateToFilter = createSelector(
  getFormValues(FILTER_FORM_ID),
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
    if (stateFilter && stateFilter.include_terminated) {
      filter.include_terminated = stateFilter.include_terminated;
    }
    if (
      stateFilter &&
      stateFilter.is_removed !== undefined &&
      stateFilter.is_removed !== ''
    ) {
      filter.is_removed = stateFilter.is_removed;
    }
    filter.user_uuid = user.uuid;
    return filter;
  },
);

export const ProjectsList = () => {
  useTitle(translate('Projects'), '', 'browser');

  // Load filters from URL on mount
  useReinitializeFilterFromUrl(FILTER_FORM_ID);

  const filter = useSelector(mapStateToFilter);
  const formValues = useSelector(getFormValues(FILTER_FORM_ID));

  // Sync filter form values to URL when they change
  useEffect(() => {
    if (formValues) {
      syncFiltersToURL(formValues);
    }
  }, [formValues]);

  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher(projectsList),
    queryField: 'name',
    filter,
    mandatoryFields: [
      'uuid',
      'name',
      'customer_uuid',
      'customer_name',
      'customer_display_billing_info_in_projects',
      'image',
    ],
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
        <ProjectLink row={row} onClick={() => onClickDetails(row)} showKind />
      ),

      copyField: (row) => row.name,
      keys: ['name', 'is_industry', 'is_removed'],
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
      title: translate('Is removed'),
      render: ({ row }) => (
        <>{row.is_removed ? translate('Yes') : translate('No')}</>
      ),
      optional: true,
      filter: 'is_removed',
      keys: ['is_removed'],
      id: 'is_removed',
      export: (row) => (row.is_removed ? translate('Yes') : translate('No')),
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

  if (
    isFeatureVisible(ProjectFeatures.estimated_cost) &&
    !isFeatureVisible(MarketplaceFeatures.conceal_prices)
  ) {
    columns.push({
      title: translate('Cost estimation'),
      render: ({ row }) =>
        row.customer_display_billing_info_in_projects === false ? (
          <>{DASH_ESCAPE_CODE}</>
        ) : (
          <>
            {defaultCurrency(
              (row.billing_price_estimate &&
                row.billing_price_estimate.total) ||
                0,
            )}
          </>
        ),

      keys: ['billing_price_estimate'],
      id: 'cost_estimation',
      export: (row) =>
        row.customer_display_billing_info_in_projects === false
          ? DASH_ESCAPE_CODE
          : defaultCurrency(
              (row.billing_price_estimate &&
                row.billing_price_estimate.total) ||
                0,
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

  if (isFeatureVisible(ProjectFeatures.show_kind_in_create_dialog)) {
    columns.push({
      title: translate('Type'),
      render: ProjectKindField,
      keys: ['kind'],
      id: 'kind',
      export: 'kind',
    });
  }

  // Grid shows 3 cards per row on xl+ screens, 2 cards per row on smaller screens
  // Default to grid view if visible rows fit nicely
  const CARDS_PER_ROW_XL = 3;
  const CARDS_PER_ROW_MD = 2;
  const isXlScreen = useMediaQuery({ minWidth: GRID_BREAKPOINTS.xl });
  // Reduce visible rows on shorter viewports (e.g., 13" laptop vs 16" laptop)
  const isShortViewport = useMediaQuery({ maxHeight: 900 });
  const VISIBLE_ROWS = isShortViewport ? 2 : 3;
  const gridThreshold = isXlScreen
    ? VISIBLE_ROWS * CARDS_PER_ROW_XL
    : VISIBLE_ROWS * CARDS_PER_ROW_MD;

  const initialModeResolver = useCallback(
    (resultCount: number): DisplayMode =>
      resultCount <= gridThreshold ? 'grid' : 'table',
    [gridThreshold],
  );

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('projects')}
      title={translate('Projects')}
      gridSize={{ md: 6, xl: 4 }}
      initialModeResolver={initialModeResolver}
      gridFixedWidth={true}
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
