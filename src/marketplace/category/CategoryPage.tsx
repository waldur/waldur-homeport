import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import MediaQuery from 'react-responsive';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { AttributeFilterListContainer } from './filters/AttributeFilterListContainer';
import { FilterBarContainer } from './filters/FilterBarContainer';
import { MobileFilterActions } from './filters/MobileFilterActions';
import { OfferingGridContainer } from './OfferingGridContainer';
import { ShopCategoriesContainer } from './ShopCategoriesContainer';

export const CategoryPage: FunctionComponent = () => {
  useTitle(translate('Marketplace offerings'));
  return (
    <Row>
      <Col lg={3}>
        <ShopCategoriesContainer />
        <MediaQuery minWidth={768}>
          <AttributeFilterListContainer />
        </MediaQuery>
      </Col>
      <Col lg={9}>
        <div className="m-b-md p-sm gray-bg">
          <div style={{ display: 'flex' }}>
            <FilterBarContainer />
            <MediaQuery maxWidth={768}>
              <MobileFilterActions />
            </MediaQuery>
          </div>
        </div>
        <OfferingGridContainer />
      </Col>
    </Row>
  );
};
