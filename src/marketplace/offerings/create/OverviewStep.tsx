import { FC } from 'react';

import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { StringField, FormContainer, FileUploadField } from '@waldur/form';
import { FormContainerProps } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';

import { ImageUploadField } from './ImageUploadField';
import { WysiwygEditor } from './WysiwygEditor';

export const OverviewStep: FC<FormContainerProps> = (props) => (
  <FormContainer {...props}>
    <StringField
      name="name"
      label={translate('Name')}
      required={true}
      validate={required}
      maxLength={150}
    />
    <WysiwygEditor name="description" label={translate('Description')} />
    <WysiwygEditor
      name="full_description"
      label={translate('Full description')}
    />
    <WysiwygEditor
      name="terms_of_service"
      label={translate('Terms of Service')}
    />
    <ImageUploadField
      name="thumbnail"
      label={translate('Offering logo')}
      accept={['image/png', 'image/jpeg', 'image/svg+xml'].join(',')}
      buttonLabel={translate('Browse')}
    />
    {isFeatureVisible('marketplace.offering_document') ? (
      <FileUploadField
        name="document.file"
        showFileName={true}
        label={translate('Documents')}
        buttonLabel={translate('Browse')}
      />
    ) : null}
    {isFeatureVisible('marketplace.offering_document') ? (
      <StringField
        name="document.name"
        placeholder={translate('Filename')}
        maxLength={150}
      />
    ) : null}
  </FormContainer>
);

OverviewStep.defaultProps = {
  submitting: false,
  labelClass: 'col-sm-2',
  controlClass: 'col-sm-8',
  clearOnUnmount: false,
};
