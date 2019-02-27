import * as React from 'react';

import { required } from '@waldur/core/validators';
import {
  StringField,
  TextField,
  FormContainer,
} from '@waldur/form-react';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import { ImageUploadField } from './ImageUploadField';

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
    <TextField
      name="full_description"
      label={props.translate('Full description')}
    />
    <StringField
      name="native_name"
      label={props.translate('Native name')}
    />
    <TextField
      name="native_description"
      label={props.translate('Native description')}
    />
    <TextField
      name="terms_of_service"
      label={props.translate('Terms of Service')}
    />
    <ImageUploadField
      name="thumbnail"
      label={props.translate('Offering logo')}
      accept={['image/png', 'image/jpeg', 'image/svg+xml'].join(',')}
      buttonLabel={props.translate('Browse')}
    />
  </FormContainer>
));
