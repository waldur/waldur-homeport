import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { formatResourceType } from '@waldur/resource/utils';

import { getResource } from '../common/api';

import { ResourceDetailsHeader } from './ResourceDetailsHeader';
import { ResourceTabs } from './ResourceTabs';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
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

  const resource = state.value;

  const header = useMemo(
    () => (resource?.resource_type ? formatResourceType(resource) : null),
    [resource],
  );

  useTitle(resource ? resource.name : translate('Resource details'), header);

  const router = useRouter();

  if (state.error) {
    router.stateService.go('errorPage.notFound');
    return null;
  }

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (!resource) {
    return null;
  }

  return (
    <Card.Body>
      <Row className="mb-4">
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
