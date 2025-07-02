import { FunctionComponent, useMemo } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

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

export const VolumeMountPointGroup: FunctionComponent<{ nodeIndex: number }> = (
  props,
) => {
  const validateMountPoint = useMemo(
    () => [required, createMountPointValidator(props.nodeIndex)],
    [props.nodeIndex],
  );

  return (
    <FormGroup label={translate('Mount point')} required={true}>
      <Field
        name="mount_point"
        component={InputField}
        validate={validateMountPoint}
      />
    </FormGroup>
  );
};
