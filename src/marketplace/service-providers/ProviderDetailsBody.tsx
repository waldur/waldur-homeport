import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';
import { OfferingGrid } from '@waldur/marketplace/common/OfferingGrid';
import { Field } from '@waldur/resource/summary';

import { OfferingLogo } from '../common/OfferingLogo';
import './ProviderDetails.scss';

export const ProviderDetailsBody = ({ provider, offerings }) => (
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
      <h2 className="font-bold m-b-lg">{provider.customer_name}</h2>
      <dl className="dl-horizontal resource-details-table col-sm-12">
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
      </dl>
      <hr />
      <h3 className="font-bold m-b-md">{translate('Offerings')}:</h3>
      <OfferingGrid width={4} loading={false} loaded={true} items={offerings} />
    </Col>
  </Row>
);
