import { useMemo } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';

import 'world-flags-sprite/stylesheets/flags32.css';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { ServiceProviderIcon } from '@waldur/navigation/workspace/ServiceProviderIcon';
import { Customer } from '@waldur/workspace/types';

import { CustomerActions } from './CustomerActions';
import { CustomerUsersBadge } from './CustomerUsersBadge';

export const CustomerProfile = ({ customer }: { customer: Customer }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(customer), [customer]);

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto">
            {customer.image ? (
              <Image src={customer.image} size={100} />
            ) : (
              <div className="symbol">
                <ImagePlaceholder
                  width="100px"
                  height="100px"
                  backgroundColor="#e2e2e2"
                >
                  <div className="symbol-label fs-2 fw-bold w-100 h-100">
                    {abbreviation}
                  </div>
                </ImagePlaceholder>
              </div>
            )}
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
                </Stack>
                <Stack direction="horizontal" className="gap-6 text-muted">
                  {[
                    customer.division_name,
                    customer.email,
                    customer.phone_number,
                  ].map((item, i) => item && <span key={i}>{item}</span>)}
                </Stack>
              </Col>
              <Col xs="auto">
                <CustomerActions />
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
