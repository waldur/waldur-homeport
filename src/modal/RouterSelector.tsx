import { useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { openstackRoutersList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';

export const RouterSelector = ({ routerValue, setRouterValue, tenantUuid }) => {
  const loadRouters = useCallback(
    () =>
      async (query, prevOptions, { page }) => {
        if (!tenantUuid) {
          return {
            options: [],
            hasMore: false,
            additional: { page: 1 },
          };
        }

        const response = await openstackRoutersList({
          query: {
            tenant_uuid: tenantUuid,
            state: ['OK'],
            name: query,
            page,
            page_size: ENV.pageSize,
            field: ['uuid', 'url', 'name'],
          },
        });

        const selectData = parseSelectData(response);
        return returnReactSelectAsyncPaginateObject(
          {
            options: selectData.options.map((router) => ({
              value: router.url,
              label: router.name,
              ...router,
            })),
            totalItems: selectData.totalItems,
          },
          prevOptions,
          page,
        );
      },
    [tenantUuid],
  );

  return (
    <div className="mt-3">
      <Form.Label>
        {translate('Router')}{' '}
        <span className="text-muted">({translate('Optional')})</span>
      </Form.Label>
      <AsyncPaginate
        value={routerValue}
        onChange={setRouterValue}
        loadOptions={loadRouters}
        defaultOptions
        placeholder={translate('Select router...')}
        isClearable
        getOptionLabel={(option) => option.label || option.name}
        getOptionValue={(option) => option.value || option.url}
      />
    </div>
  );
};
