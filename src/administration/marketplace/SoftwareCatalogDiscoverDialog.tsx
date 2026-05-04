import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import {
  marketplaceSoftwareCatalogsDiscoverList,
  marketplaceSoftwareCatalogsImportCatalog,
} from 'waldur-js-client';
import type { NameEnum, SoftwareCatalogDiscover } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const ImportCatalogAction = ({
  row,
  refetch,
}: {
  row: SoftwareCatalogDiscover;
  refetch(): void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceSoftwareCatalogsImportCatalog({
        body: { name: row.name as NameEnum },
      }),
    successMessage: translate('Catalog import started.'),
    errorMessage: translate('Unable to import catalog.'),
    refetch,
  });

  return (
    <ActionItem
      title={translate('Import')}
      action={mutate}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      disabled={row.existing || isPending}
      tooltip={
        row.existing ? translate('Catalog is already imported.') : undefined
      }
    />
  );
};

const DiscoverActions = ({
  row,
  refetch,
}: {
  row: SoftwareCatalogDiscover;
  refetch(): void;
}) => (
  <ActionsDropdown row={row} refetch={refetch}>
    <ImportCatalogAction row={row} refetch={refetch} />
  </ActionsDropdown>
);

export const SoftwareCatalogDiscoverDialog = () => {
  const fetchData = useCallback(
    () =>
      marketplaceSoftwareCatalogsDiscoverList().then((response) => ({
        rows: response.data,
        resultCount: response.data?.length ?? 0,
      })),
    [],
  );
  const filter = useMemo(() => ({}), []);
  const tableProps = useTable({
    table: 'SoftwareCatalogDiscover',
    fetchData,
    filter,
  });

  return (
    <ModalDialog title={translate('Upstream catalog versions')}>
      <Table<SoftwareCatalogDiscover>
        {...tableProps}
        columns={[
          {
            title: translate('Name'),
            render: ({ row }) => <>{row.name}</>,
          },
          {
            title: translate('Type'),
            render: ({ row }) => <>{row.catalog_type}</>,
          },
          {
            title: translate('Current version'),
            render: ({ row }) => <>{renderFieldOrDash(row.existing_version)}</>,
          },
          {
            title: translate('Latest version'),
            render: ({ row }) => <>{row.latest_version}</>,
          },
          {
            title: translate('Update available'),
            render: ({ row }) =>
              row.update_available ? (
                <Badge variant="success" pill outline>
                  {translate('Yes')}
                </Badge>
              ) : (
                <Badge variant="default" pill outline>
                  {translate('No')}
                </Badge>
              ),
          },
        ]}
        verboseName={translate('upstream catalogs')}
        rowActions={({ row }) => (
          <DiscoverActions row={row} refetch={tableProps.fetch} />
        )}
        rowKey="name"
        hasPagination={false}
      />
    </ModalDialog>
  );
};
