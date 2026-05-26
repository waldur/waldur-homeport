import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Offering } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { OfferingCard } from './OfferingCard';

interface OfferingGridProps {
  width?: number;
  items: Offering[];
  loaded: boolean;
  loading: boolean;
}

export const OfferingGrid: FC<OfferingGridProps> = ({
  width = 3,
  ...props
}) => {
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
      {props.items.map((offering) => (
        <Col key={offering.uuid} lg={6} xl={width} className="mb-3">
          <OfferingCard offering={offering} />
        </Col>
      ))}
    </Row>
  );
};
