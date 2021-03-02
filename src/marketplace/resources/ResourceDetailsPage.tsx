import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { BookingActions } from '@waldur/booking/BookingActions';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
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
  const {
    params: { resource_uuid },
  } = useCurrentStateAndParams();

  const [state, reInitResource] = useAsyncFn(() => getResource(resource_uuid), [
    resource_uuid,
  ]);

  useEffectOnce(() => {
    reInitResource();
  });

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

  if (!state.value) {
    return null;
  }

  const resource = state.value;
  return (
    <>
      {resource.offering_type === OFFERING_TYPE_BOOKING && (
        <Row className="m-b-md pull-right">
          <Col lg={12}>
            <BookingActions
              resource={resource}
              reInitResource={reInitResource}
            />
          </Col>
        </Row>
      )}
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
