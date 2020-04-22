import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import useAsync from 'react-use/lib/useAsync';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { TemplateCard } from './TemplateCard';

export const CatalogTemplatesList = () => {
  const {
    params: { catalogUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const loadData = React.useCallback(
    () =>
      getAll('/rancher-templates/', {
        params: { catalog_uuid: catalogUuid },
      }),
    [catalogUuid],
  );

  const state = useAsync(loadData, []);

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load applications templates.')}</h3>;
  }

  if (!state.value?.length) {
    return (
      <h3 className="text-center">
        {translate('There are no applications templates.')}
      </h3>
    );
  }

  return (
    <Row>
      {state.value.map((template, index) => (
        <Col key={index} md={4} sm={6}>
          <TemplateCard template={template} clusterUuid={clusterUuid} />
        </Col>
      ))}
    </Row>
  );
};
