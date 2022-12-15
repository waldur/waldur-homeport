import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const InstanceComponents = ({ resource }) => {
  const { volumes } = resource;
  const volumeTypes = useMemo<Record<string, number>>(
    () =>
      volumes.reduce(
        (result, volume) => ({
          ...result,
          [volume.type_name]: (result[volume.type_name] || 0) + volume.size,
        }),
        {},
      ),
    [volumes],
  );
  return (
    <>
      <Row>
        <Col className="text-center">
          <div className="fs-1">{resource.cores}</div>
          <p className="text-muted">{translate('vCPU')}</p>
        </Col>
        <Col className="text-center">
          <div className="fs-1">{(resource.ram / 1024).toFixed()} GB</div>
          <p className="text-muted">{translate('RAM')}</p>
        </Col>
      </Row>
      <Row>
        {Object.entries(volumeTypes)
          .sort(([aType], [bType]) => aType.localeCompare(bType))
          .map(([volumeType, usage]) => (
            <Col key={volumeType} className="text-center">
              <div className="fs-1">{(usage / 1024).toFixed()} GB</div>
              <p className="text-muted">
                {translate('{type} storage', { type: volumeType })}
              </p>
            </Col>
          ))}
      </Row>
      <Row>
        <Col>
          <p className="text-muted text-center">
            {translate('Flavor: {flavor}', { flavor: resource.flavor_name })}
          </p>
        </Col>
        <Col>
          <p className="text-muted text-center">
            {translate('Image: {image}', { image: resource.image_name })}
          </p>
        </Col>
      </Row>
    </>
  );
};
