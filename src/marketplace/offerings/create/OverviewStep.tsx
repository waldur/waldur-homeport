import * as React from 'react';

import { required } from '@waldur/core/validators';
import {
  FileUploadField,
  StringField,
  TextField,
  FormContainer,
} from '@waldur/form-react';
import { TranslateProps, withTranslation } from '@waldur/i18n';

export const OverviewStep = withTranslation((props: TranslateProps) => (
  <FormContainer
    submitting={false}
    labelClass="col-sm-2"
    controlClass="col-sm-8"
    clearOnUnmount={false}>
    <StringField
      name="name"
      label={props.translate('Name')}
      required={true}
      validate={required}
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
));
