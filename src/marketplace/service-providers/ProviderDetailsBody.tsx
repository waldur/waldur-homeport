import { FunctionComponent } from 'react';
import { Col, Row, Container } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingGrid } from '@waldur/marketplace/common/OfferingGrid';
import { Field } from '@waldur/resource/summary';

import { OfferingLogo } from '../common/OfferingLogo';

import './ProviderDetails.scss';

export const ProviderDetailsBody: FunctionComponent<{
  provider;
  offerings;
}> = ({ provider, offerings }) => (
  <Row>
    <Col md={3}>
      {provider.customer_image && (
        <div className="provider-description">
          <div className="provider-description__logo">
            <OfferingLogo src={provider.customer_image} />
          </div>
        </div>
      )}
    </Col>
    <Col md={9}>
      <h2 className="font-bold mb-4">{provider.customer_name}</h2>
      <Col sm={12}>
        <Container>
          {provider.customer_native_name && (
            <Field
              label={translate('Native name')}
              value={provider.customer_native_name}
            />
          )}
          {provider.customer_abbreviation && (
            <Field
              label={translate('Abbreviation')}
              value={provider.customer_abbreviation}
            />
          )}
        </Container>
      </Col>

      <hr />
      <h3 className="font-bold mb-3">{translate('Offerings')}:</h3>
      <OfferingGrid width={4} loading={false} loaded={true} items={offerings} />
    </Col>
  </Row>
);
