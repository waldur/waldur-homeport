import React from 'react';
import { Card, Col, Form, Image, Row, Stack } from 'react-bootstrap';

import 'world-flags-sprite/stylesheets/flags32.css';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ServiceProviderIcon } from '@waldur/navigation/workspace/ServiceProviderIcon';
import { Customer } from '@waldur/workspace/types';

import { SymbolsGroup } from './SymbolsGroup';

export const CustomerProfile = ({ customer }: { customer: Customer }) => {
  const owners = React.useMemo(
    () =>
      customer.owners.map((owner) => ({
        email: owner.email,
        full_name: owner.full_name,
      })),
    [customer],
  );
  const members = React.useMemo(
    () =>
      customer.service_managers.map((member) => ({
        email: member.email,
        full_name: member.full_name,
      })),
    [customer],
  );

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto">
            {customer.image ? (
              <Image
                width={200}
                height={200}
                src={customer.image}
                rounded={true}
              />
            ) : (
              <ImagePlaceholder width="200px" height="200px" />
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
                  {customer.division_name && <>{customer.division_name}</>}
                  {customer.email && <>{customer.email}</>}
                  {customer.phone_number && <>{customer.phone_number}</>}
                </Stack>
              </Col>
              <Col xs="auto">
                <div className="buttons">
                  <Link className="btn btn-light me-4" state="">
                    {translate('View resources')}
                  </Link>
                  <Link className="btn btn-light" state="organization.manage">
                    {translate('Manage')}
                  </Link>
                </div>
              </Col>
            </Row>
            {owners && owners.length > 0 && (
              <Form.Group as={Row} className="mb-1">
                <Form.Label column sm={3} md={2}>
                  {translate('Owners:')}
                </Form.Label>
                <Col>
                  <SymbolsGroup items={owners} />
                </Col>
              </Form.Group>
            )}
            {members && members.length > 0 && (
              <Form.Group as={Row} className="mb-1">
                <Form.Label column sm={3} md={2}>
                  {translate('Members:')}
                </Form.Label>
                <Col>
                  <SymbolsGroup items={members} />
                </Col>
              </Form.Group>
            )}
            <Form.Group as={Row} className="align-items-center mb-1">
              <Form.Label column sm={3} md={2}>
                {translate('Support:')}
              </Form.Label>
              <Col>
                <Link state="" className="text-decoration-underline text-dark">
                  {translate('Go to support')}
                </Link>
              </Col>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
