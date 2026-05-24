import { useQuery } from '@tanstack/react-query';
import { Col, Form, Row } from 'react-bootstrap';
import { marketplaceOfferingPermissionsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SymbolsGroup } from '@/customer/dashboard/SymbolsGroup';
import { translate } from '@/i18n';
import { Customer } from '@/workspace/types';

export const ProviderOfferingPermissions = ({
  customer,
}: {
  customer: Customer;
}) => {
  const {
    isLoading: loading,
    error,
    data: offeringPermissions,
  } = useQuery({
    queryKey: ['ProviderOfferingPermissions', customer],

    queryFn: () =>
      getAllPages((page) =>
        marketplaceOfferingPermissionsList({
          query: { page, page_size: MAX_PAGE_SIZE, customer: customer.uuid },
        }),
      ),
  });

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
