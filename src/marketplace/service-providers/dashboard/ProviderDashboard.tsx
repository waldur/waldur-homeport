import { Col, Row } from 'react-bootstrap';

import { PermissionEnum } from '@/permissions/enums';
import { HelpdeskSetupCard } from '@/provider-helpdesk/common/HelpdeskSetupCard';
import { useUser } from '@/workspace/hooks';
import { checkServiceProviderPermission } from '@/workspace/selectors';

import { ProviderDashboardChart } from './ProviderDashboardChart';
import { ProviderWidgets } from './ProviderWidgets';

export const ProviderDashboard = ({ provider }) => {
  const user = useUser();
  if (!provider) {
    return null;
  }
  // A custom provider role may reach the workspace without revenue or
  // statistics rights; skip the cards whose requests Mastermind would refuse.
  const organization = { uuid: provider.customer_uuid };
  const canSeeRevenue = checkServiceProviderPermission(
    organization,
    user,
    PermissionEnum.GET_SERVICE_PROVIDER_REVENUE,
  );
  const canSeeStatistics = checkServiceProviderPermission(
    organization,
    user,
    PermissionEnum.GET_SERVICE_PROVIDER_STATISTICS,
  );
  return (
    <>
      <HelpdeskSetupCard />
      <Row>
        {canSeeRevenue && (
          <Col md={12} lg={6}>
            <ProviderDashboardChart provider={provider} />
          </Col>
        )}
        {canSeeStatistics && (
          <Col md={12} lg={6}>
            <ProviderWidgets provider={provider} />
          </Col>
        )}
      </Row>
    </>
  );
};
