import * as React from 'react';
import { FieldArray, Field } from 'redux-form';

import {
  SelectAsyncField,
  FormContainer,
} from '@waldur/form-react';
import { withTranslation } from '@waldur/i18n';

import { OfferingAttributes } from './OfferingAttributes';

const renderField = props => (
  <div className="form-group">
    <label className="control-label col-sm-3">
      {props.label}
    </label>
    <div className="col-sm-9">
      <input
        className="form-control"
        {...props.input}
        type={props.type}
      />
    </div>
  </div>
);

const renderFlavors = withTranslation(props => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-9">
      {props.fields.map((flavor, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <button
              type="button"
              className="close"
              aria-label={props.translate('Remove offering flavor')}
              onClick={() => props.fields.remove(index)}>
              <span aria-hidden="true">&times;</span>
            </button>
            <h4>{props.translate('Offering flavor #{{index}}', {index: index + 1})}</h4>
          </div>
          <div className="panel-body">
            <Field
              name={`${flavor}.name`}
              type="text"
              label={props.translate('Name')}
              component={renderField}
            />
            <Field
              name={`${flavor}.price`}
              type="text"
              label={props.translate('Price')}
              component={renderField}
            />
            <div className="form-group">
              <label className="col-sm-offset-3 col-sm-9">
                {props.translate('Attributes')}
              </label>
            </div>
            <Field
              name={`${flavor}.vcpu`}
              type="text"
              label="vCPU"
              component={renderField}
            />
            <Field
              name={`${flavor}.ram`}
              type="text"
              label="RAM"
              component={renderField}
            />
            <Field
              name={`${flavor}.disk`}
              type="text"
              label="Disk"
              component={renderField}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-default"
        onClick={() => props.fields.push({})}>
        <i className="fa fa-plus"/>
        {' '}
        {props.translate('Add offering flavor')}
      </button>
    </div>
  </div>
));

export const OfferingConfigureStep = props => (
  <>
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-3"
      controlClass="col-sm-9"
      clearOnUnmount={false}>
      <SelectAsyncField
        name="category"
        label={props.translate('Category')}
        loadOptions={props.loadCategories}
        required={true}
        labelKey="title"
        valueKey="url"
      />
    </FormContainer>
    {props.category && <OfferingAttributes {...props}/>}
    <FieldArray name="flavors" component={renderFlavors} />
  </>
);
