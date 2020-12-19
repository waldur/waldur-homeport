import { FunctionComponent } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const ServiceProviderIcon: FunctionComponent<{ organization }> = ({
  organization,
}) =>
  organization.is_service_provider ? (
    <Tooltip
      label={translate('Service provider')}
      id={`service-provider-${organization.uuid}`}
      className="pull-right"
    >
      <i className="provider-icon svgfonticon svgfonticon-provider" />
    </Tooltip>
  ) : null;
