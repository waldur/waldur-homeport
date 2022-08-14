import { FC } from 'react';
import { Card, Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';

import { AddOptionButton } from './AddOptionButton';
import { OptionForm } from './OptionForm';

export const OfferingOptions: FC<any> = (props) => {
  return (
    <Form.Group>
      <h3 className="content-center mt-3 mb-4">
        {translate(
          'If you want user to provide additional details when ordering, please configure input form for the user below',
        )}
      </h3>
      {props.fields.map((option, index) => (
        <Card key={index}>
          <Card.Header>
            <Card.Title>
              <h3>
                {translate('User input field #{index}', {
                  index: index + 1,
                })}
              </h3>
            </Card.Title>
            <div className="card-toolbar">
              <RemoveButton
                onClick={() => props.fields.remove(index)}
                disabled={props.readOnly}
              />
            </div>
          </Card.Header>
          <Card.Body>
            <OptionForm option={option} readOnly={props.readOnly} />
          </Card.Body>
        </Card>
      ))}
      <AddOptionButton
        onClick={() => props.fields.push({})}
        disabled={props.readOnly}
      >
        {translate('Add user input field')}
      </AddOptionButton>
    </Form.Group>
  );
};
