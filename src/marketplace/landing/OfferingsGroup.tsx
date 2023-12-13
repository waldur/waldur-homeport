import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { OfferingCard } from '../common/OfferingCard';

import { OfferingsQueryResult } from './hooks';

export const OfferingsGroup: FC<OfferingsQueryResult> = (props) => {
  if (props.isLoading) {
    return <LoadingSpinner />;
  }

  if (props.isError) {
    return (
      <h3 className="text-center">{translate('Unable to load offerings.')}</h3>
    );
  }

  if (!props.data?.length) {
    return (
      <h3 className="text-center">
        {translate('There are no offerings in marketplace yet.')}
      </h3>
    );
  }

  return (
    <Row>
      {props.data.map((offering, index) => (
        <Col key={index} xl={2} lg={4} sm={6}>
          <OfferingCard offering={offering} />
        </Col>
      ))}
    </Row>
  );
};
