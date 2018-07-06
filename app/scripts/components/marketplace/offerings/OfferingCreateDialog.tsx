import * as React from 'react';

import { StringField, TextField, SelectIconField, FileUploadField } from '@waldur/form-react';
import { ActionDialog } from '@waldur/modal/ActionDialog';

const OfferingAttributes = props =>
  props.category ? props.category.sections.map((section, sectionIndex) => (
    <div key={sectionIndex}>
      <h4>{section.title}</h4>
      {section.attributes.map((attribute, attributeIndex) => (
        <div key={attributeIndex}>
          <StringField
            name={attribute.key}
            label={attribute.title}
          />
        </div>
      ))}
    </div>
  )) : null;

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
    <FileUploadField
      name="thumbnail"
      label={props.translate('Logo')}
      description={props.translate('Offering logo')}
      accept={['image/png', 'image/jpeg', 'image/svg+xml'].join(',')}
      buttonLabel={props.translate('Browse')}
      showFileName={true}
    />
    <SelectIconField
      name="category"
      label={props.translate('Category')}
      options={props.categories}
      required={true}
      labelKey="title"
      valueKey="url"
      iconKey="icon"
    />
    <OfferingAttributes {...props}/>
  </ActionDialog>
);
