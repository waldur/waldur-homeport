import { Col, Form, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { translate } from '@waldur/i18n';
import { getAllOfferingPermissions } from '@waldur/marketplace/common/api';
import { Customer } from '@waldur/workspace/types';

export const ProviderOfferingPermissions = ({
  customer,
}: {
  customer: Customer;
}) => {
  const {
    loading,
    error,
    value: offeringPermissions,
  } = useAsync(
    () =>
      getAllOfferingPermissions({
        params: {
          customer: customer.uuid,
        },
      }),
    [customer],
  );

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load users')}</>
  ) : (
    offeringPermissions &&
    offeringPermissions.length > 0 && (
      <Form.Group as={Row}>
        <Form.Label column xs="auto">
          {translate('Offering managers:')}
        </Form.Label>
        <Col>
          <SymbolsGroup
            items={offeringPermissions}
            max={6}
            nameKey="user_full_name"
            emailKey="user_email"
          />
        </Col>
      </Form.Group>
    )
  );
};
