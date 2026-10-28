import { useMemo } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';

import { QuotaCell } from '../QuotaCell';
import { getStorageTitle } from '../storageTitle';

const ResourceComponentItem = ({ title, usage, units }) => {
  return (
    <div>
      <QuotaCell usage={usage} title={title} units={units} />
    </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-x-5">
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
    </div>
  );
};
