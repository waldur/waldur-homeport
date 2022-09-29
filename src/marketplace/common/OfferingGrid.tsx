import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OfferingsListType } from '@waldur/marketplace/types';

import { OfferingCard } from './OfferingCard';

interface OfferingGridProps extends OfferingsListType {
  width?: number;
}

export const OfferingGrid: React.FC<OfferingGridProps> = (props) => {
  if (props.loading) {
    return <LoadingSpinner />;
  }

  if (!props.loaded) {
    return (
      <h3 className="text-center">{translate('Unable to load offerings.')}</h3>
    );
  }

  if (!props.items.length) {
    return (
      <h3 className="text-center">
        {translate('There are no offerings in marketplace yet.')}
      </h3>
    );
  }

  return (
    <Row>
      {props.items.map((offering, index) => (
        <Col key={index} xl={2} lg={props.width} sm={6}>
          <OfferingCard offering={offering} />
        </Col>
      ))}
    </Row>
  );
};

OfferingGrid.defaultProps = {
  width: 3,
};
