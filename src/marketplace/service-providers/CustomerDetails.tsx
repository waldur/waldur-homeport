import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Customer } from '@waldur/customer/types';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { OfferingGrid } from '@waldur/marketplace/common/OfferingGrid';
import { CustomerDescription } from '@waldur/marketplace/service-providers/CustomerDescription';
import { CustomerDetailsTable } from '@waldur/marketplace/service-providers/CustomerDetailsTable';
import { Offering} from '@waldur/marketplace/types';

interface CustomerDetailsProps extends TranslateProps {
  customer: Customer;
  offerings: Offering[];
  loading: boolean;
  erred: boolean;
}

const renderBody = (props: CustomerDetailsProps) => {
  if (props.loading) {
    return <LoadingSpinner/>;
  } else if (props.erred) {
    return props.translate('Unable to load provider details.');
  } else {
    return (
      <Row>
        <Col md={4}>
          <CustomerDescription customer={props.customer} />
        </Col>
        <Col md={8}>
          <CustomerDetailsTable customer={props.customer}/>
          <OfferingGrid
            width={4}
            loading={false}
            loaded={true}
            items={props.offerings}
          />
        </Col>
      </Row>
    );
  }
};

export const CustomerDetails = withTranslation((props: CustomerDetailsProps) => (
  <div className="ibox">
    <div className="ibox-content">
      {renderBody(props)}
    </div>
  </div>
));
