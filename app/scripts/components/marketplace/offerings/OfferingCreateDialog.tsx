import * as React from 'react';

import {
  FileUploadField,
  SelectAsyncField,
  StringField,
  TextField,
  FormContainer,
  FieldError,
  SubmitButton,
} from '@waldur/form-react';

import { OfferingAttributes } from './OfferingAttributes';

export const OfferingCreateDialog = props => (
  <form
    onSubmit={props.handleSubmit(props.createOffering)}
    className="form-horizontal">
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-3"
      controlClass="col-sm-5">
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
      <SelectAsyncField
        name="category"
        label={props.translate('Category')}
        loadOptions={props.loadCategories}
        required={true}
        labelKey="title"
        valueKey="url"
      />
      {props.category && <OfferingAttributes {...props}/>}
    </FormContainer>
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-5">
        <FieldError error={props.error}/>
        <SubmitButton
          disabled={props.invalid}
          submitting={props.submitting}
          label={props.translate('Submit')}
        />
        <button
          type="button"
          className="btn btn-default m-l-sm"
          onClick={props.gotoOfferingList}>
          {props.translate('Cancel')}
        </button>
      </div>
    </div>
  </form>
);
