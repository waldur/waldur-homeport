import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';

import { OfferingHeader } from './OfferingHeader';

export const PublicOfferingDetails = () => {
  const { state, call } = useQuery(async () => {
    const offering = await getOffering($state.params.uuid);
    const category = await getCategory(offering.category_uuid);
    const tabs = getTabs({ offering, sections: category.sections });
    return { offering, tabs };
  });
  React.useEffect(call, []);

  if (state.loading) {
    return <LoadingSpinner />;
  } else if (state.error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  } else if (state.loaded) {
    const { offering, tabs } = state.data;
    return (
      <div className="wrapper wrapper-content">
        <div className="white-box">
          <div style={{ display: 'flex' }} className="m-b-lg">
            <OfferingLogo src={offering.thumbnail} style={{ width: 64 }} />
            <div className="m-l-sm">
              <h2>{offering.name}</h2>
              <p>
                {translate('Provided by {provider}', {
                  provider: offering.customer_name,
                })}
              </p>
            </div>
          </div>
          <OfferingHeader offering={offering} hideName={true} />
          <Row>
            <Col lg={12}>
              <OfferingTabsComponent tabs={tabs} />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  return null;
};
