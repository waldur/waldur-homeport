import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceSoftwareCatalogsList,
  marketplaceSoftwareCatalogsUpdateCatalog,
  overrideSettingsRetrieve,
} from 'waldur-js-client';
import type { SoftwareCatalog } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { SettingsCard } from '../settings/SettingsCard';
import { useSettingsUrlSync } from '../settings/useSettingsUrlSync';

const SoftwareCatalogDiscoverDialog = lazyComponent(() =>
  import('./SoftwareCatalogDiscoverDialog').then((m) => ({
    default: m.SoftwareCatalogDiscoverDialog,
  })),
);

const TABS = [
  { key: 'catalogs', title: translate('Enabled catalogues') },
  { key: 'general', title: translate('General') },
  { key: 'eessi', title: 'EESSI' },
  { key: 'spack', title: 'Spack' },
];

const SETTINGS_GROUP_NAMES = {
  general: translate('Software catalog general'),
  eessi: translate('Software catalog EESSI'),
  spack: translate('Software catalog Spack'),
};

const UpdateCatalogButton = ({
  row,
  refetch,
}: {
  row: SoftwareCatalog;
  refetch(): void;
}) => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);

  const handleUpdate = useCallback(async () => {
    setPending(true);
    try {
      await marketplaceSoftwareCatalogsUpdateCatalog({
        path: { uuid: row.uuid },
        body: { name: row.name, version: row.version },
      });
      dispatch(showSuccess(translate('Catalog update started.')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to update catalog.')));
    } finally {
      setPending(false);
    }
  }, [dispatch, row.uuid, row.name, row.version, refetch]);

  return (
    <ActionButton
      action={handleUpdate}
      title={translate('Update')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      pending={pending}
    />
  );
};

const CatalogsTab = () => {
  const dispatch = useDispatch();
  const filter = useMemo(() => ({}), []);
  const tableProps = useTable({
    table: 'AdminSoftwareCatalogs',
    fetchData: createFetcher(marketplaceSoftwareCatalogsList),
    filter,
  });

  const openDiscover = useCallback(
    () =>
      dispatch(openModalDialog(SoftwareCatalogDiscoverDialog, { size: 'lg' })),
    [dispatch],
  );

  return (
    <Table<SoftwareCatalog>
      {...tableProps}
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
        <UpdateCatalogButton row={row} refetch={tableProps.fetch} />
      )}
      tableActions={
        <ActionButton
          action={openDiscover}
          title={translate('Check for updates')}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
        />
      }
    />
  );
};

const SettingsTab = ({ groupName }: { groupName: string }) => {
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

  return data ? (
    <SettingsCard groupNames={[groupName]} settingsSource={data} />
  ) : null;
};

export const AdministrationSoftwareCatalog = () => {
  const { activeKey, handleSelect, defaultActiveKey } = useSettingsUrlSync(
    TABS,
    'tab',
  );

  return (
    <Card className="card-bordered">
      <Card.Body>
        <Tab.Container
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onSelect={handleSelect}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="catalogs" unmountOnExit>
              <CatalogsTab />
            </Tab.Pane>
            <Tab.Pane eventKey="general" unmountOnExit>
              <SettingsTab groupName={SETTINGS_GROUP_NAMES.general} />
            </Tab.Pane>
            <Tab.Pane eventKey="eessi" unmountOnExit>
              <SettingsTab groupName={SETTINGS_GROUP_NAMES.eessi} />
            </Tab.Pane>
            <Tab.Pane eventKey="spack" unmountOnExit>
              <SettingsTab groupName={SETTINGS_GROUP_NAMES.spack} />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};
