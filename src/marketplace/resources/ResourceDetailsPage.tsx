import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

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

  useTitle(state.value ? state.value.name : translate('Resource details'));

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
