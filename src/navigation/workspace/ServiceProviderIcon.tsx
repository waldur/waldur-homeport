import { FunctionComponent } from 'react';
import { Badge } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const ServiceProviderIcon: FunctionComponent<{
  organization;
  className?;
}> = ({ organization, className }) =>
  organization.is_service_provider ? (
    <Tip
      label={translate('Service provider')}
      id={`service-provider-${organization.uuid}`}
      className={className}
    >
      <Badge bg="primary" className="badge-circle pe-none">
        SP
      </Badge>
    </Tip>
  ) : null;
