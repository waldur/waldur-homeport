import { FunctionComponent } from 'react';
import { Badge } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const CallManagerIcon: FunctionComponent<{
  organization;
  className?;
}> = ({ organization, className }) =>
  organization.is_call_managing_organization &&
  isFeatureVisible('marketplace.show_call_management_functionality') ? (
    <Tip
      label={translate('Call manager')}
      id={`call-manager-${organization.uuid}`}
      className={className}
    >
      <Badge bg="primary" className="badge-circle pe-none">
        CM
      </Badge>
    </Tip>
  ) : null;
