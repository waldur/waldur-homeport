import { useMemo } from 'react';
import { openstackRoutersList } from 'waldur-js-client';

import { FormField, FormLabel } from 'waldur-ui';

import { createLoadOptions, AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';

export const RouterSelector = ({ routerValue, setRouterValue, tenantUuid }) => {
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
    <FormField className="mt-3">
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
