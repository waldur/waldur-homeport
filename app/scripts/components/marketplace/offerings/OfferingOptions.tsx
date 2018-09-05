import * as React from 'react';

import { withTranslation } from '@waldur/i18n';

import { OptionForm } from './OptionForm';

const AddOptionButton = withTranslation(props => (
  <button
    type="button"
    className="btn btn-default"
    onClick={props.onClick}>
    <i className="fa fa-plus"/>
    {' '}
    {props.translate('Add option')}
  </button>
));

const RemoveOptionButton = withTranslation(props => (
  <button
    type="button"
    className="close"
    aria-label={props.translate('Remove')}
    onClick={props.onClick}>
    <span aria-hidden="true">&times;</span>
  </button>
));

export const OfferingOptions = withTranslation(props => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-9">
      {props.fields.map((option, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <RemoveOptionButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('Option #{index}', {index: index + 1})}</h4>
          </div>
          <div className="panel-body">
            <OptionForm option={option}/>
          </div>
        </div>
      ))}
      <AddOptionButton onClick={() => props.fields.push({})}/>
    </div>
  </div>
));
