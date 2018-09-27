import * as React from 'react';

import { withTranslation } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { ComponentAddButton } from './ComponentAddButton';
import { ComponentRow } from './ComponentRow';

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
