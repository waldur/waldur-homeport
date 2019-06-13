import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';

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
        <Panel key={index}>
          <Panel.Heading>
            <RemoveButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('User input field #{index}', {index: index + 1})}</h4>
          </Panel.Heading>
          <Panel.Body>
            <OptionForm option={option}/>
          </Panel.Body>
        </Panel>
      ))}
      <AddOptionButton onClick={() => props.fields.push({})}>
        {props.translate('Add user input field')}
      </AddOptionButton>
    </Col>
  </div>
));
