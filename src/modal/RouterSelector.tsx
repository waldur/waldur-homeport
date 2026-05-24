import { useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { openstackRoutersList } from 'waldur-js-client';

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
    <div className="mt-3">
      <Form.Label>
        {translate('Router')}{' '}
        <span className="text-muted">({translate('Optional')})</span>
      </Form.Label>
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
    </div>
  );
};
