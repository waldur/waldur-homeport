import { FC } from 'react';
import { Col, Panel } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';

import { AddOptionButton } from './AddOptionButton';
import { OptionForm } from './OptionForm';

export const OfferingOptions: FC<any> = (props) => (
  <div className="form-group">
    <h3 className="content-center m-t-md m-b-lg">
      {translate(
        'If you want user to provide additional details when ordering, please configure input form for the user below',
      )}
    </h3>
    <Col smOffset={2} sm={8}>
      {props.fields.map((option, index) => (
        <Panel key={index}>
          <Panel.Heading>
            <RemoveButton onClick={() => props.fields.remove(index)} />
            <h4>
              {translate('User input field #{index}', {
                index: index + 1,
              })}
            </h4>
          </Panel.Heading>
          <Panel.Body>
            <OptionForm option={option} />
          </Panel.Body>
        </Panel>
      ))}
      <AddOptionButton onClick={() => props.fields.push({})}>
        {translate('Add user input field')}
      </AddOptionButton>
    </Col>
  </div>
);
