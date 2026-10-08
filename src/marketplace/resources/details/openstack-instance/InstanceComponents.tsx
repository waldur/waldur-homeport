import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';

import { QuotaCell } from '../QuotaCell';
import { getStorageTitle } from '../storageTitle';

const ResourceComponentItem = ({ title, usage, units }) => {
  return (
    <Col xs={12} sm={6} md={12} xl={6}>
      <QuotaCell usage={usage} title={title} units={units} />
    </Col>
  );
};

export const InstanceComponents = ({
  resource,
}: {
  resource: OpenStackInstance;
}) => {
  const { volumes } = resource;
  const volumeTypes = useMemo<Record<string, number>>(() => {
    const result = {};
    volumes.forEach((volume) => {
      // Untyped volumes carry no type_name; group them under one key.
      const type = volume.type_name || '';
      result[type] = (result[type] || 0) + volume.size;
    });
    return result;
  }, [volumes]);

  return (
    <Row>
      <ResourceComponentItem
        title={translate('vCPU')}
        usage={resource.cores}
        units={null}
      />

      <ResourceComponentItem
        title={translate('RAM')}
        usage={(resource.ram / 1024).toFixed()}
        units="GB"
      />

      {Object.entries(volumeTypes)
        .sort(([aType], [bType]) => aType.localeCompare(bType))
        .map(([volumeType, usage]) => (
          <ResourceComponentItem
            key={volumeType}
            title={getStorageTitle(volumeType)}
            usage={(usage / 1024).toFixed()}
            units="GB"
          />
        ))}
    </Row>
  );
};
