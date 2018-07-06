import * as React from 'react';

import {
  FileUploadField,
  SelectAsyncField,
  StringField,
  TextField,
  SelectField,
} from '@waldur/form-react';
import { ActionDialog } from '@waldur/modal/ActionDialog';

import { OfferingAttributes } from './OfferingAttributes';

export const OfferingCreateDialog = props => (
  <ActionDialog
    title={props.translate('Add offering')}
    submitLabel={props.translate('Submit')}
    onSubmit={props.handleSubmit(props.createOffering)}
    submitting={props.submitting}
    error={props.error}>
    <StringField
      name="name"
      label={props.translate('Name')}
      required={true}
    />
    <TextField
      name="description"
      label={props.translate('Description')}
    />
    <SelectField
      name="preferred_language"
      label={props.translate('Language')}
      options={props.languageChoices}
      labelKey="label"
      valueKey="value"
    />
    {props.preferred_language && (
      <StringField
        name="native_name"
        label={props.translate('Native name')}
      />
    )}
    {props.preferred_language && (
      <TextField
        name="native_description"
        label={props.translate('Native description')}
      />
    )}
    <FileUploadField
      name="thumbnail"
      label={props.translate('Offering logo')}
      accept={['image/png', 'image/jpeg', 'image/svg+xml'].join(',')}
      buttonLabel={props.translate('Browse')}
      showFileName={true}
    />
    <SelectAsyncField
      name="category"
      label={props.translate('Category')}
      loadOptions={props.loadCategories}
      required={true}
      labelKey="title"
      valueKey="url"
    />
    {props.category && <OfferingAttributes {...props}/>}
  </ActionDialog>
);
