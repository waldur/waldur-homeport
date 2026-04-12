import { FC, useMemo } from 'react';
import {
  MarketplaceResourcesListData,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { getResourceAllListColumns } from '@waldur/marketplace/resources/list/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { UIBlockProps } from '../../lib/types';

export const ResourceListBlock: FC<UIBlockProps> = ({ block }) => {
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
