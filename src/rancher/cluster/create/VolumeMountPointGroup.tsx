import { FunctionComponent, useMemo } from 'react';

import { composeValidators, required } from '@/core/validators';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

import { getDataVolumes } from './utils';

const createMountPointValidator = (nodeIndex: number) => (value, allValues) => {
  if (!value) {
    return;
  }
  const volumes = getDataVolumes(nodeIndex, allValues);
  let count = 0;
  for (const volume of volumes) {
    if (volume.mount_point === value) {
      count++;
    }
    if (count > 1) {
      return translate('Each mount point should be used once at most.');
    }
  }
};

export const VolumeMountPointGroup: FunctionComponent<{
  nodeIndex: number;
  name?: string;
}> = (props) => {
  const validateMountPoint = useMemo(
    () =>
      composeValidators(required, createMountPointValidator(props.nodeIndex)),
    [props.nodeIndex],
  );

  return (
    <StringGroup
      label={translate('Mount point')}
      required={true}
      name={props.name || 'mount_point'}
      validate={validateMountPoint}
    />
  );
};
