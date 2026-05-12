import { FunctionComponent, useMemo } from 'react';
import { Field } from 'react-final-form';

import { composeValidators, required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

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
    <FormGroup label={translate('Mount point')} required={true}>
      <Field
        name={props.name || 'mount_point'}
        component={InputField as any}
        validate={validateMountPoint}
      />
    </FormGroup>
  );
};
