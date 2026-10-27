import { useMemo } from 'react';
import { openstackRoutersList } from 'waldur-js-client';

import { ConfirmationExtraField, FormField, FormLabel } from 'waldur-ui';

import { createLoadOptions, AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';

const RouterSelector = ({ routerValue, setRouterValue, tenantUuid }) => {
  const loadRouters = useMemo(
    () =>
      tenantUuid
        ? createLoadOptions(openstackRoutersList, 'name', {
            tenant_uuid: tenantUuid,
            state: ['OK'],
            field: ['uuid', 'url', 'name'],
          })
        : () =>
            Promise.resolve({
              options: [],
              hasMore: false,
              additional: { page: 1 },
            }),
    [tenantUuid],
  );

  return (
    <FormField className="mt-2.5">
      <FormLabel>
        {translate('Router')}{' '}
        <span className="text-quaternary">({translate('Optional')})</span>
      </FormLabel>
      <AsyncSelect
        key={tenantUuid}
        value={routerValue}
        onChange={setRouterValue}
        loadOptions={loadRouters}
        defaultOptions
        placeholder={translate('Select router...')}
        isClearable
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
      />
    </FormField>
  );
};

/**
 * The router picker as a confirmation's extra field: `confirm()` resolves
 * with `{ router: <url> }` when one is picked.
 */
export const routerConfirmField = (
  tenantUuid: string,
): ConfirmationExtraField => ({
  resultKey: 'router',
  toResult: (router) => router.url,
  render: (routerValue, setRouterValue) => (
    <RouterSelector
      routerValue={routerValue}
      setRouterValue={setRouterValue}
      tenantUuid={tenantUuid}
    />
  ),
});
