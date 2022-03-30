import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';
import { getWorkspace } from '@waldur/workspace/selectors';
import {
  Customer,
  PROJECT_WORKSPACE,
  WorkspaceType,
} from '@waldur/workspace/types';

import { getResource } from '../common/api';

import { ResourceDetailsHeader } from './ResourceDetailsHeader';
import { ResourceTabs } from './ResourceTabs';
import { Resource } from './types';

interface GetBreadcrumbsProps {
  workspace: WorkspaceType;
  customer: Customer;
  resource: Resource;
}

const getBreadcrumbs = ({
  workspace,
}: GetBreadcrumbsProps): BreadcrumbItem[] => [
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

export const ResourceDetailsPage: FunctionComponent<ResourceDetailsPageProps> =
  ({ customer }) => {
    const workspace = useSelector(getWorkspace);
    const {
      params: { resource_uuid },
    } = useCurrentStateAndParams();

    const [state, reInitResource] = useAsyncFn(
      () => getResource(resource_uuid),
      [resource_uuid],
    );

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
      <Card.Body>
        <Row className="m-b-lg">
          <Col sm={12}>
            <ResourceDetailsHeader
              resource={resource}
              reInitResource={reInitResource}
            />
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <ResourceTabs resource={resource} />
          </Col>
        </Row>
      </Card.Body>
    );
  };
