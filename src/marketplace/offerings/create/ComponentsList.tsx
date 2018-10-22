import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import { WrappedFieldArrayProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { ComponentAddButton } from './ComponentAddButton';
import { ComponentForm } from './ComponentForm';

type Props = TranslateProps & WrappedFieldArrayProps<any>;

export const ComponentsList = withTranslation((props: Props) => (
  <div className="form-group">
    <Col smOffset={2} sm={8} className="m-b-sm">
      <p className="form-control-static">
        <strong>{props.translate('Plan components')}</strong>
      </p>
    </Col>

    <Col smOffset={2} sm={8}>
      {props.fields.map((component, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <RemoveButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('Component #{index}', {index: index + 1})}</h4>
          </div>
          <div className="panel-body">
            <ComponentForm component={component}/>
          </div>
        </div>
      ))}
      <ComponentAddButton onClick={() => props.fields.push({})}/>
    </Col>
  </div>
));
