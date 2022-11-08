import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getCategory,
  getProviderOffering,
} from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { Offering } from '@waldur/marketplace/types';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

export const ServiceProviderOfferingsListExpandableRow: FunctionComponent<{
  row: Offering;
}> = ({ row }) => {
  const {
    loading,
    error,
    value: tabs,
  } = useAsync(async () => {
    const offering = await getProviderOffering(row.uuid, ANONYMOUS_CONFIG);
    const category = await getCategory(
      offering.category_uuid,
      ANONYMOUS_CONFIG,
    );
    return getTabs({ offering, sections: category.sections });
  }, [row]);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load offering details.')}</h3>
  ) : tabs.length ? (
    <div className="white-box">
      <Row>
        <Col lg={12}>
          <OfferingTabsComponent tabs={tabs} />
        </Col>
      </Row>
    </div>
  ) : null;
};
