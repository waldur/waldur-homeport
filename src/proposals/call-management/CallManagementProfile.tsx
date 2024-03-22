import { useMemo } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';

import 'world-flags-sprite/stylesheets/flags32.css';
import { CustomerUsersBadge } from '@waldur/customer/dashboard/CustomerUsersBadge';
import { DashboardHeroLogo } from '@waldur/dashboard/hero/DashboardHeroLogo';
import { CallManagerIcon } from '@waldur/navigation/workspace/CallManagerIcon';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { ServiceProviderIcon } from '@waldur/navigation/workspace/ServiceProviderIcon';
import { Customer } from '@waldur/workspace/types';

export const CallManagementProfile = ({ customer }: { customer: Customer }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(customer), [customer]);

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto" className="mb-4">
            <DashboardHeroLogo
              logo={customer.image}
              logoAlt={abbreviation}
              logoBottomLabel="Call manager"
              logoBottomClass="bg-secondary"
            />
          </Col>
          <Col>
            <Row className="mb-6">
              <Col>
                <Stack direction="horizontal" className="gap-6 text-muted mb-1">
                  <div className="d-flex align-items-center gap-2">
                    {customer.country && (
                      <i className="f32">
                        <i
                          className={`flag ${customer.country?.toLowerCase()}`}
                        ></i>
                      </i>
                    )}
                    <h2 className="mb-0">{customer.name}</h2>
                  </div>
                  <ServiceProviderIcon organization={customer} />
                  <CallManagerIcon organization={customer} />
                </Stack>
                <Stack direction="horizontal" className="gap-6 text-muted">
                  {[
                    customer.organization_group_name,
                    customer.email,
                    customer.phone_number,
                  ].map((item, i) => item && <span key={i}>{item}</span>)}
                </Stack>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <CustomerUsersBadge />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
