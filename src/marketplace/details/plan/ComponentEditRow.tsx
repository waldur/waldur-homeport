import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';
import { ComponentRow } from '@waldur/marketplace/details/plan/ComponentRow';

import { Component } from './types';

export const ComponentEditRow = (props: {periods: string[], components: Component[]}) => (
  <>
    <tr className="text-center">
      <td colSpan={3 + props.periods.length}>
        {translate('Please enter estimated maximum usage in the rows below:')}
      </td>
    </tr>
    {props.components.map((component, index) => {
      const field = (
        <Field
          name={`limits.${component.type}`}
          component="input"
          className="form-control"
          type="number"
          min={0}
          parse={parseIntField}
          format={formatIntField}
        />
      );
      return <ComponentRow
        key={index}
        component={component}
        className="form-control-static"
        field={field}
      />;
      })
    }
  </>
);
