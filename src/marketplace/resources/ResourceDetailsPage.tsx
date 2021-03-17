import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { BookingActions } from '@waldur/booking/BookingActions';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OfferingDetailsButton } from '@waldur/marketplace/offerings/details/OfferingDetailsButton';
import { ShowReportButton } from '@waldur/marketplace/resources/report/ShowReportButton';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';
import { isOracleOffering } from '@waldur/support/utils';
import { getWorkspace } from '@waldur/workspace/selectors';
import {
  Customer,
  PROJECT_WORKSPACE,
  WorkspaceType,
} from '@waldur/workspace/types';

import { getResource } from '../common/api';

import { ResourceSummary } from './ResourceSummary';
import { ResourceTabs } from './ResourceTabs';
import { Resource } from './types';

interface GetBreadcrumbsProps {
  workspace: WorkspaceType;
  customer: Customer;
  resource: Resource;
}

const getBreadcrumbs = ({
  workspace,
  customer,
  resource,
}: GetBreadcrumbsProps): BreadcrumbItem[] => [
  {
    label:
      workspace === PROJECT_WORKSPACE
        ? translate('Project workspace')
        : translate('Organization workspace'),
    state:
      workspace === PROJECT_WORKSPACE
        ? 'project.details'
        : 'organization.details',
    params: {
      uuid: customer ? customer.uuid : resource.customer_uuid,
    },
  },
  {
    label:
      workspace === PROJECT_WORKSPACE
        ? translate('Resources')
        : translate('Public resources'),
  },
];

interface ResourceDetailsPageProps {
  customer?: Customer;
}

export const ResourceDetailsPage: FunctionComponent<ResourceDetailsPageProps> = ({
  customer,
}) => {
  const workspace = useSelector(getWorkspace);
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
      state.value
        ? getBreadcrumbs({ workspace, customer, resource: state.value })
        : [],
    [workspace, state.value, customer],
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
    <div className="wrapper wrapper-content">
      <div className="ibox-content">
        {resource.offering_type === OFFERING_TYPE_BOOKING && (
          <Row className="m-b-md pull-right">
            <Col lg={12}>
              <BookingActions
                resource={resource}
                reInitResource={reInitResource}
              />
              {!isOracleOffering(resource) &&
                Array.isArray(resource.report) && (
                  <ShowReportButton report={resource.report} />
                )}
              {resource.offering_uuid && (
                <OfferingDetailsButton offering={resource.offering_uuid} />
              )}
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
      </div>
    </div>
  );
};
