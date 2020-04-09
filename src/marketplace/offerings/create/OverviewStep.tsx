import * as React from 'react';

import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  StringField,
  FormContainer,
  FileUploadField,
} from '@waldur/form-react';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import { ImageUploadField } from './ImageUploadField';
import { WysiwygEditor } from './WysiwygEditor';

export const OverviewStep = withTranslation((props: TranslateProps) => (
  <FormContainer
    submitting={false}
    labelClass="col-sm-2"
    controlClass="col-sm-8"
    clearOnUnmount={false}
  >
    <StringField
      name="name"
      label={props.translate('Name')}
      required={true}
      validate={required}
      maxLength={150}
    />
    <WysiwygEditor name="description" label={props.translate('Description')} />
    <WysiwygEditor
      name="full_description"
      label={props.translate('Full description')}
    />
    <StringField
      name="native_name"
      label={props.translate('Native name')}
      maxLength={150}
    />
    <WysiwygEditor
      name="native_description"
      label={props.translate('Native description')}
    />
    <WysiwygEditor
      name="terms_of_service"
      label={props.translate('Terms of Service')}
    />
    <ImageUploadField
      name="thumbnail"
      label={props.translate('Offering logo')}
      accept={['image/png', 'image/jpeg', 'image/svg+xml'].join(',')}
      buttonLabel={props.translate('Browse')}
    />
    {isFeatureVisible('marketplace.documents') ? (
      <FileUploadField
        name="document.file"
        showFileName={true}
        label={props.translate('Documents')}
        buttonLabel={props.translate('Browse')}
      />
    ) : null}
    {isFeatureVisible('marketplace.documents') ? (
      <StringField
        name="document.name"
        placeholder={props.translate('Filename')}
        maxLength={150}
      />
    ) : null}
  </FormContainer>
));
