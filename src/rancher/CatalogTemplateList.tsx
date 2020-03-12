import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { TemplateCard } from './TemplateCard';

const CatalogTemplatesList = () => {
  const { state, call } = useQuery(() =>
    getAll('/rancher-templates/', {
      params: { catalog_uuid: $state.params.uuid },
    }),
  );
  React.useEffect(call, []);

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load applications templates.')}</h3>;
  }

  if (!state.loaded) {
    return null;
  }

  if (!state.data.length) {
    return (
      <h3 className="text-center">
        {translate('There are no applications templates.')}
      </h3>
    );
  }

  return (
    <Row>
      {state.data.map((template, index) => (
        <Col key={index} md={4} sm={6}>
          <TemplateCard template={template} />
        </Col>
      ))}
    </Row>
  );
};

export default connectAngularComponent(CatalogTemplatesList);
