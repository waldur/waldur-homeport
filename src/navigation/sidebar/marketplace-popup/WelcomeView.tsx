import { FunctionComponent } from 'react';
import { Col } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Customer } from '@waldur/workspace/types';

export const WelcomeView: FunctionComponent<{
  customer: Customer;
}> = ({ customer }) => {
  return (
    <Col xs={6}>
      <div className="welcome-view d-flex flex-column align-items-center justify-content-center px-4 h-50 min-h-150px mh-500px">
        <h3 className="text-white">{translate('Welcome to marketplace')}</h3>
        <p className="text-white text-nowrap mb-10">
          {translate('Your source for everything as a service.')}
        </p>
        {customer && (
          <span data-kt-menu-dismiss="true">
            <Link
              state="marketplace-landing-customer"
              params={{ uuid: customer.uuid }}
              className="btn btn-white btn-hover-rise btn-active-light-primary"
            >
              {translate('Browse')}
            </Link>
          </span>
        )}
      </div>
      <div className="d-flex align-items-center justify-content-center px-4 h-50 min-h-150px mh-500px">
        <p>{translate('Select root category')}</p>
      </div>
    </Col>
  );
};
