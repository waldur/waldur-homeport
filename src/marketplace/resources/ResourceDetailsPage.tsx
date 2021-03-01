import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { BookingResourceActions } from '@waldur/marketplace/resources/BookingResourceActions';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';
import { Customer } from '@waldur/workspace/types';

import { getResource } from '../common/api';

import { ResourceSummary } from './ResourceSummary';
import { ResourceTabs } from './ResourceTabs';
import { Resource } from './types';

interface GetBreadcrumbsProps {
  customer: Customer;
  resource: Resource;
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

export const ResourceDetailsPage: FunctionComponent<ResourceDetailsPageProps> = ({
  customer,
}) => {
  const [shouldUpdateResource, setShouldUpdateResource] = useState();
  const {
    params: { resource_uuid },
  } = useCurrentStateAndParams();

  const state = useAsync(() => getResource(resource_uuid), [
    resource_uuid,
    shouldUpdateResource,
  ]);

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
    <div className="wrapper wrapper-content">
      <Row className="m-b-md">
        <Col sm={12}>
          <BookingResourceActions
            resource={resource}
            updateResource={(e) => setShouldUpdateResource(e)}
          />
          <ResourceSummary resource={resource} />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <ResourceTabs resource={resource} />
        </Col>
      </Row>
    </div>
  );
};
