import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { useTitle } from '@waldur/navigation/title';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

import { OfferingHeader } from './OfferingHeader';

export const PublicOfferingDetails = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const state = useAsync(async () => {
    const offering = await getOffering(uuid, ANONYMOUS_CONFIG);
    const category = await getCategory(
      offering.category_uuid,
      ANONYMOUS_CONFIG,
    );
    const tabs = getTabs({ offering, sections: category.sections });
    return { offering, tabs };
  }, [uuid]);
  useTitle(
    state.value ? state.value.offering.name : translate('Offering details'),
  );

  if (state.loading) {
    return <LoadingSpinner />;
  } else if (state.error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  } else if (state.value) {
    const { offering, tabs } = state.value;
    return (
      <div className="wrapper wrapper-content">
        <div className="white-box">
          <div style={{ display: 'flex' }} className="m-b-lg">
            <OfferingLogo
              src={offering.thumbnail}
              style={{ maxWidth: 64, maxHeight: 64 }}
            />
            <div className="m-l-sm">
              <h2 style={{ marginTop: 0 }}>{offering.name}</h2>
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
