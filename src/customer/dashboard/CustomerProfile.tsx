import { At, DeviceMobile, Hexagon } from '@phosphor-icons/react';
import { Col, Row, Stack } from 'react-bootstrap';

import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';
import { ProviderOfferingPermissions } from '@waldur/marketplace/service-providers/dashboard/ProviderOfferingPermissions';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { Customer } from '@waldur/workspace/types';

import { CustomerActions } from './CustomerActions';

interface CustomerProfileProps {
  customer: Customer;
  fromServiceProvider?: boolean;
}

export const CustomerProfile = ({
  customer,
  fromServiceProvider,
}: CustomerProfileProps) => (
  <PublicDashboardHero2
    hideQuickSection
    logo={customer.image}
    logoAlt={getItemAbbreviation(customer)}
    logoCircle
    cardBordered
    title={
      <div>
        <Stack direction="horizontal" gap={4} className="text-muted mb-3">
          {customer.country && (
            <CountryFlag
              countryCode={customer.country}
              fontSize={22}
              className="h-25px"
            />
          )}
          <h3 className="mb-0">{customer.name}</h3>
        </Stack>
        <Stack
          direction="horizontal"
          gap={5}
          className="flex-wrap text-muted lh-1"
        >
          {customer.organization_group_name && (
            <span className="text-nowrap">
              <Hexagon size={18} weight="duotone" className="me-1" />
              {customer.organization_group_name}
            </span>
          )}
          {customer.email && (
            <span className="text-nowrap">
              <At size={18} weight="duotone" className="me-1" />
              {customer.email}
            </span>
          )}
          {customer.phone_number &&
            typeof customer.phone_number === 'string' && (
              <span className="text-nowrap">
                <DeviceMobile size={18} weight="duotone" className="me-1" />
                {customer.phone_number}
              </span>
            )}
        </Stack>
      </div>
    }
    actions={<CustomerActions customer={customer} />}
  >
    {fromServiceProvider ? (
      <Row>
        <Col xs={12}>
          <ProviderOfferingPermissions customer={customer} />
        </Col>
      </Row>
    ) : null}
  </PublicDashboardHero2>
);
