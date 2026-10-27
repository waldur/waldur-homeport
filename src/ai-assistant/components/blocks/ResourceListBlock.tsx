import { TableIcon } from '@phosphor-icons/react';
import { FC, useContext, useMemo } from 'react';
import {
  MarketplaceResourcesListData,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { getResourceAllListColumns } from '@/marketplace/resources/list/utils';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { UIBlockProps } from '../../lib/types';

import { OfflineBlockContext } from './offlineBlockContext';

export const ResourceListBlock: FC<UIBlockProps> = ({ block }) => {
  const isOffline = useContext(OfflineBlockContext);
  return isOffline ? (
    <OfflineResourceList block={block} />
  ) : (
    <LiveResourceList block={block} />
  );
};

const LiveResourceList: FC<UIBlockProps> = ({ block }) => {
  const stateKey = block.state?.join(',') ?? '';

  const filter = useMemo(() => {
    const f: MarketplaceResourcesListData['query'] = {};
    f.state = block.state?.length
      ? (block.state as MarketplaceResourcesListData['query']['state'])
      : NON_TERMINATED_STATES;
    if (block.project_uuid) f.project_uuid = block.project_uuid;
    if (block.customer_uuid) f.customer_uuid = block.customer_uuid;
    if (block.category_uuid) f.category_uuid = block.category_uuid;
    return f;
  }, [block.project_uuid, block.customer_uuid, block.category_uuid, stateKey]);

  const tableId = useMemo(
    () =>
      `chat-resources-${block.project_uuid ?? ''}-${block.customer_uuid ?? ''}-${block.category_uuid ?? ''}-${stateKey}`,
    [block.project_uuid, block.customer_uuid, block.category_uuid, stateKey],
  );

  const columns = useMemo(() => getResourceAllListColumns(true, true), []);

  const tableProps = useTable({
    table: tableId,
    fetchData: createFetcher(marketplaceResourcesList),
    queryField: 'query',
    filter,
    staleTime: UI_STALE_TIME,
  });

  return (
    <div className="aui-resource-list-block">
      <Table
        {...tableProps}
        columns={columns}
        title={translate('Resources')}
        verboseName={translate('Resources')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        hasQuery={true}
        showPageSizeSelector={true}
      />
    </div>
  );
};

const OfflineResourceList: FC<UIBlockProps> = ({ block }) => {
  const filterRows: Array<{ key: string; value: string }> = [];
  if (block.customer_uuid) {
    filterRows.push({
      key: translate('Customer'),
      value: block.customer_uuid,
    });
  }
  if (block.project_uuid) {
    filterRows.push({ key: translate('Project'), value: block.project_uuid });
  }
  if (block.category_uuid) {
    filterRows.push({
      key: translate('Category'),
      value: block.category_uuid,
    });
  }
  if (block.state?.length) {
    filterRows.push({ key: translate('State'), value: block.state.join(', ') });
  }

  return (
    <div className="aui-resource-list-block border rounded bg-tertiary dark:bg-quaternary p-2.5">
      <div className="flex items-center justify-between mb-1.5 gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <TableIcon weight="bold" />
          <strong>{translate('Resource table')}</strong>
        </div>
        <Badge variant="neutral" size="sm" tone="outline" hasBullet>
          {translate('Not rendered')}
        </Badge>
      </div>
      {filterRows.length > 0 ? (
        <div className="flex flex-col gap-1 small">
          {filterRows.map((f) => (
            <div key={f.key} className="flex gap-1.5">
              <span className="text-quaternary" style={{ minWidth: 90 }}>
                {f.key}
              </span>
              <span className="wrap-anywhere">{f.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="small text-quaternary italic">
          {translate('No filters applied')}
        </div>
      )}
    </div>
  );
};
