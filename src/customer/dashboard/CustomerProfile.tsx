import {
  AtIcon,
  DeviceMobileIcon,
  HexagonIcon,
  HashIcon,
} from '@phosphor-icons/react';
import { Col, Row, Stack } from 'react-bootstrap';

import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
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
  <PublicDashboardHero
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
          {customer.organization_groups.length > 0 && (
            <span className="text-nowrap">
              <HexagonIcon size={18} weight="duotone" className="me-1" />
              {customer.organization_groups
                .map((group) => group.name)
                .join(', ')}
            </span>
          )}
          {customer.email && (
            <span className="text-nowrap">
              <AtIcon size={18} weight="duotone" className="me-1" />
              {customer.email}
            </span>
          )}
          {customer.phone_number &&
            typeof customer.phone_number === 'string' && (
              <span className="text-nowrap">
                <DeviceMobileIcon size={18} weight="duotone" className="me-1" />
                {customer.phone_number}
              </span>
            )}
          {customer.registration_code &&
            typeof customer.registration_code === 'string' && (
              <span className="text-nowrap">
                <HashIcon size={18} weight="duotone" className="me-1" />
                {customer.registration_code}
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
  </PublicDashboardHero>
);
