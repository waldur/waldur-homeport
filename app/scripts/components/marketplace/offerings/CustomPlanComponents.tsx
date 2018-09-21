import * as React from 'react';

import { withTranslation } from '@waldur/i18n';

import { ComponentRow } from './ComponentRow';
import { RemoveButton } from './RemoveButton';

const ComponentAddButton = withTranslation(props => (
  <button
    type="button"
    className="btn btn-default"
    onClick={props.onClick}>
    <i className="fa fa-plus"/>
    {' '}
    {props.translate('Add component')}
  </button>
));

export const CustomPlanComponents = withTranslation(props => props.fields.length > 0 ? (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{props.translate('Internal name')}</th>
        <th>{props.translate('Display name')}</th>
        <th>{props.translate('Amount')}</th>
        <th>{props.translate('Price')}</th>
        <th>{props.translate('Units')}</th>
        <th>{/* Actions */}</th>
      </tr>
    </thead>
    <tbody>
      {props.fields.map((component, index) =>
        <ComponentRow key={index} component={component}>
          <div className="form-control-static">
            <RemoveButton onClick={() => props.fields.remove(index)}/>
          </div>
        </ComponentRow>
      )}
      <tr>
        <td colSpan={6}>
          <ComponentAddButton onClick={() => props.fields.push({})}/>
        </td>
      </tr>
    </tbody>
  </table>
) : (
  <ComponentAddButton onClick={() => props.fields.push({})}/>
));
