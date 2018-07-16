import * as React from 'react';

import {
  FileUploadField,
  StringField,
  TextField,
  FormContainer,
} from '@waldur/form-react';

export const OfferingDescribeStep = props => (
  <FormContainer
    submitting={props.submitting}
    labelClass="col-sm-3"
    controlClass="col-sm-9"
    clearOnUnmount={false}>
    <StringField
      name="name"
      label={props.translate('Name')}
      required={true}
    />
    <TextField
      name="description"
      label={props.translate('Description')}
    />
    <StringField
      name="native_name"
      label={props.translate('Native name')}
    />
    <TextField
      name="native_description"
      label={props.translate('Native description')}
    />
    <FileUploadField
      name="thumbnail"
      label={props.translate('Offering logo')}
      accept={['image/png', 'image/jpeg', 'image/svg+xml'].join(',')}
      buttonLabel={props.translate('Browse')}
      showFileName={true}
    />
  </FormContainer>
);
