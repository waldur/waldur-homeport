import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';
import { Customer } from '@waldur/workspace/types';

import { getResource } from '../common/api';
import { OrderItemResponse } from '../orders/types';

import { ResourceSummary } from './ResourceSummary';
import { ResourceTabs } from './ResourceTabs';

interface GetBreadcrumbsProps {
  customer: Customer;
  resource: OrderItemResponse;
}

const getBreadcrumbs = ({
  customer,
  resource,
}: GetBreadcrumbsProps): BreadcrumbItem[] => [
  {
    label: translate('Organization workspace'),
    state: 'organization.details',
    params: {
      uuid: customer ? customer.uuid : resource.customer_uuid,
    },
  },
  {
    label: translate('Public resources'),
  },
];

interface ResourceDetailsPageProps {
  customer?: Customer;
}

export const ResourceDetailsPage = ({ customer }: ResourceDetailsPageProps) => {
  const {
    params: { resource_uuid },
  } = useCurrentStateAndParams();

  const state = useAsync(() => getResource(resource_uuid), [resource_uuid]);

  useTitle(state.value ? state.value.name : translate('Resource details'));

  useBreadcrumbsFn(
    () =>
      state.value ? getBreadcrumbs({ customer, resource: state.value }) : [],
    [state.value, customer],
  );

  const router = useRouter();

  if (state.error) {
    router.stateService.go('errorPage.notFound');
    return null;
  }

  if (state.loading) {
    return <LoadingSpinner />;
  }

  const resource = state.value;
  return (
    <>
      <Row className="m-b-md">
        <Col sm={12}>
          <ResourceSummary resource={resource} />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <ResourceTabs resource={resource} />
        </Col>
      </Row>
    </>
  );
};
