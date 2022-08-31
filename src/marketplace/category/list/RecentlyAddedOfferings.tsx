import React from 'react';
import { Card } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OfferingsListType } from '@waldur/marketplace/types';

import { OfferingCard } from './OfferingCard';

type RecentlyAddedOfferingsProps = OfferingsListType;

export const RecentlyAddedOfferings: React.FC<RecentlyAddedOfferingsProps> = (
  props,
) => {
  return (
    <Card className="mb-6">
      <Card.Header>
        <div className="d-flex w-100 align-items-center">
          <h3>{translate('Recently added offerings')}</h3>
        </div>
      </Card.Header>
      <Card.Body>
        {props.loading ? (
          <LoadingSpinner />
        ) : !props.loaded ? (
          <h3 className="text-center">
            {translate('Unable to load offerings.')}
          </h3>
        ) : !props.items ? (
          <h3 className="text-center">
            {translate('There are no offerings recently added in marketplace.')}
          </h3>
        ) : (
          props.items.map((offering, index) => (
            <OfferingCard key={index} offering={offering} />
          ))
        )}
      </Card.Body>
    </Card>
  );
};
