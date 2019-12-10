import * as React from 'react';
import { Field, FieldArray } from 'redux-form';

import { translate } from '@waldur/i18n';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { DataVolumesList } from './DataVolumesList';
import { IntegerUnitField } from './IntegerUnitField';
import { SimpleSelectField } from './SimpleSelectField';

export const NodeStorageGroup = props => (
  <>
    <FormGroup
      label={translate('System volume size')}
      required={true}>
      <Field
        name="system_volume_size"
        units={translate('GB')}
        component={IntegerUnitField}
        parse={parseIntField}
        format={formatIntField}
      />
    </FormGroup>
    {props.volumeTypes.length > 0 && (
      <FormGroup
        label={translate('System volume type')}
        required={true}>
        <Field
          name="system_volume_type"
          options={props.volumeTypes}
          component={SimpleSelectField}
        />
      </FormGroup>
    )}
    {props.mountPoints.length > 0 && (
      <FieldArray
        name="data_volumes"
        component={DataVolumesList}
        mountPoints={props.mountPoints}
        volumeTypes={props.volumeTypes}
      />
    )}
  </>
);
