import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';

import { QuotaCell } from './QuotaCell';

const ResourceComponentItem = ({ title, usage, units, isSmallScreen }) => {
  return (
    <Col xs={isSmallScreen ? 12 : 6} sm={6} md={12} xl={6}>
      <QuotaCell usage={usage} title={title} units={units} />
    </Col>
  );
};

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
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });

  return (
    <Row>
      <ResourceComponentItem
        title={translate('vCPU')}
        usage={resource.cores}
        units={null}
        isSmallScreen={isSmallScreen}
      />
      <ResourceComponentItem
        title={translate('RAM')}
        usage={(resource.ram / 1024).toFixed()}
        units="GB"
        isSmallScreen={isSmallScreen}
      />
      {Object.entries(volumeTypes)
        .sort(([aType], [bType]) => aType.localeCompare(bType))
        .map(([volumeType, usage]) => (
          <ResourceComponentItem
            key={volumeType}
            title={translate('{type} storage', { type: volumeType })}
            usage={(usage / 1024).toFixed()}
            units="GB"
            isSmallScreen={isSmallScreen}
          />
        ))}
    </Row>
  );
};
