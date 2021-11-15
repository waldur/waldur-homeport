import { FunctionComponent } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

const ProviderIcon = require('@waldur/images/icons/provider.svg');

export const ServiceProviderIcon: FunctionComponent<{ organization }> = ({
  organization,
}) =>
  organization.is_service_provider ? (
    <Tooltip
      label={translate('Service provider')}
      id={`service-provider-${organization.uuid}`}
      className="pull-right"
    >
      <img src={ProviderIcon} width="18" className="m-r-sm" />
    </Tooltip>
  ) : null;
