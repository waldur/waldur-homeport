import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import type { SoftwareCatalog } from 'waldur-js-client';
import {
  marketplaceSoftwareCatalogsList,
  marketplaceSoftwareCatalogsUpdateCatalog,
  overrideSettingsRetrieve,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { tabTableProps } from '@/administration/tabTableProps';
import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { SettingsDescription } from '@/SettingsDescription';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithTabs } from '@/table/TableWithTabs';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { FieldRow } from '../settings/FieldRow';

const SoftwareCatalogDiscoverDialog = lazyComponent(() =>
  import('./SoftwareCatalogDiscoverDialog').then((m) => ({
    default: m.SoftwareCatalogDiscoverDialog,
  })),
);

const UpdateCatalogAction = ({
  row,
  refetch,
}: {
  row: SoftwareCatalog;
  refetch(): void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceSoftwareCatalogsUpdateCatalog({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Catalog update started.'),
    errorMessage: translate('Unable to update catalog.'),
    refetch,
  });

  return (
    <ActionItem
      title={translate('Update')}
      action={() => mutate()}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={isPending}
    />
  );
};

const CatalogsTab: FC<Partial<TableWithPortal>> = ({ portal }) => {
  const { openDialog } = useModal();
  const filter = useMemo(() => ({}), []);
  const tableProps = useTable({
    table: 'AdminSoftwareCatalogs',
    fetchData: createFetcher(marketplaceSoftwareCatalogsList),
    filter,
  });

  const openDiscover = useCallback(
    () => openDialog(SoftwareCatalogDiscoverDialog, { size: 'lg' }),
    [],
  );

  return (
    <Table<SoftwareCatalog>
      {...tableProps}
      {...tabTableProps(portal)}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Type'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.catalog_type_display)}</>
          ),
        },
        {
          title: translate('Version'),
          render: ({ row }) => <>{renderFieldOrDash(row.version)}</>,
        },
        {
          title: translate('Packages'),
          render: ({ row }) => <>{row.package_count.toLocaleString()}</>,
        },
        {
          title: translate('Versions'),
          render: ({ row }) => <>{row.version_count.toLocaleString()}</>,
        },
        {
          title: translate('Targets'),
          render: ({ row }) => <>{row.target_count.toLocaleString()}</>,
        },
        {
          title: translate('Last updated'),
          render: ({ row }) => (
            <>
              {row.last_successful_update
                ? formatDateTime(row.last_successful_update)
                : renderFieldOrDash(null)}
            </>
          ),
        },
      ]}
      verboseName={translate('software catalogs')}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <UpdateCatalogAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      tableActions={
        <BaseButton
          onClick={openDiscover}
          label={translate('Check for updates')}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          variant="tertiary"
          size="lg"
        />
      }
    />
  );
};

// A settings group rendered straight into the tab pane, as SettingsWithTabs
// does: the page header already names the page, so a card per group would
// only add a second border and repeat the tab title.
const SettingsTab: FC<{ groupName: string }> = ({ groupName }) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['SoftwareCatalogSettings'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load software catalog settings.')}
        loadData={refetch}
      />
    );

  const group = SettingsDescription.find((g) => g.description === groupName);
  if (!group) return null;

  return (
    <FormTable>
      {group.items.map((item) => (
        <FieldRow item={item} key={item.key} value={data?.[item.key]} />
      ))}
    </FormTable>
  );
};

const settingsTab = (groupName: string) => {
  const Component = () => <SettingsTab groupName={groupName} />;
  return Component;
};

const TABS = [
  {
    key: 'catalogs',
    title: translate('Enabled catalogues'),
    component: CatalogsTab,
  },
  {
    key: 'general',
    title: translate('General'),
    component: settingsTab(translate('Software catalog general')),
  },
  {
    key: 'eessi',
    title: 'EESSI',
    component: settingsTab(translate('Software catalog EESSI')),
  },
  {
    key: 'spack',
    title: 'Spack',
    component: settingsTab(translate('Software catalog Spack')),
  },
];

export const AdministrationSoftwareCatalog = () => (
  <TableWithTabs
    title={translate('Software catalog')}
    subtitle={translate(
      'Software catalogues and their EESSI and Spack sources.',
    )}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
