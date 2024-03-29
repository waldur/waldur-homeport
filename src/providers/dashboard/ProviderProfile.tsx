import { useMemo } from 'react';
import { Card, Col, Form, Row, Stack } from 'react-bootstrap';
import { useAsync } from 'react-use';

import 'world-flags-sprite/stylesheets/flags32.css';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { translate } from '@waldur/i18n';
import { getAllOfferingPermissions } from '@waldur/marketplace/common/api';
import { ServiceProvider } from '@waldur/marketplace/types';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';

export const ProviderProfile = ({
  provider,
}: {
  provider: ServiceProvider;
}) => {
  const {
    loading,
    error,
    value: offeringPermissions,
  } = useAsync(
    () =>
      getAllOfferingPermissions({
        params: {
          customer: provider.customer_uuid,
        },
      }),
    [provider],
  );
  const abbreviation = useMemo(() => getItemAbbreviation(provider), [provider]);

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto">
            {provider.customer_image ? (
              <Image src={provider.customer_image} size={100} />
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
            <Row className="min-h-60px mb-6">
              <Col>
                <Stack direction="horizontal" className="gap-6 text-muted mb-1">
                  <h2 className="mb-0">{provider.customer_name}</h2>
                </Stack>
                <Stack direction="horizontal" className="gap-6 text-muted">
                  <span>{translate('Service provider')}</span>
                  <span>{provider.organizationGroup}</span>
                </Stack>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className="d-flex justify-content-between align-items-center gap-6">
                  {loading ? (
                    <LoadingSpinner />
                  ) : error ? (
                    <>{translate('Unable to load users')}</>
                  ) : (
                    offeringPermissions &&
                    offeringPermissions.length > 0 && (
                      <Form.Group as={Row} className="mb-1">
                        <Form.Label column xs="auto">
                          {translate('Offering managers:')}
                        </Form.Label>
                        <Col>
                          <SymbolsGroup
                            items={offeringPermissions}
                            max={6}
                            nameKey="user_full_name"
                            emailKey="user_email"
                          />
                        </Col>
                      </Form.Group>
                    )
                  )}
                  {provider.customer_country && (
                    <i className="f32">
                      <i
                        className={`flag ${provider.customer_country?.toLowerCase()}`}
                      ></i>
                    </i>
                  )}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
