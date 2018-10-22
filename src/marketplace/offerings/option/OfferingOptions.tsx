import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import { WrappedFieldArrayProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { AddOptionButton } from './AddOptionButton';
import { OptionForm } from './OptionForm';

type Props = TranslateProps & WrappedFieldArrayProps<any>;

export const OfferingOptions = withTranslation((props: Props) => (
  <div className="form-group">
    <Col smOffset={2} sm={8}>
      {props.fields.map((option, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <RemoveButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('User input field #{index}', {index: index + 1})}</h4>
          </div>
          <div className="panel-body">
            <OptionForm option={option}/>
          </div>
        </div>
      ))}
      <AddOptionButton onClick={() => props.fields.push({})}/>
    </Col>
  </div>
));
