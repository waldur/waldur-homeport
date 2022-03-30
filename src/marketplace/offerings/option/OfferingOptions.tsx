import { FC, useContext } from 'react';
import { Col, Card, Form } from 'react-bootstrap';

import { FormLayoutContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';

import { AddOptionButton } from './AddOptionButton';
import { OptionForm } from './OptionForm';

export const OfferingOptions: FC<any> = (props) => {
  const { layout } = useContext(FormLayoutContext);

  const col = layout === 'vertical' ? 0 : 8;
  const offset = layout === 'vertical' ? 0 : 2;

  return (
    <Form.Group>
      <h3 className="content-center m-t-md m-b-lg">
        {translate(
          'If you want user to provide additional details when ordering, please configure input form for the user below',
        )}
      </h3>
      <Col smOffset={offset} sm={col}>
        {props.fields.map((option, index) => (
          <Card key={index}>
            <Card.Header>
              <RemoveButton
                onClick={() => props.fields.remove(index)}
                disabled={props.readOnly}
              />
              <h4>
                {translate('User input field #{index}', {
                  index: index + 1,
                })}
              </h4>
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
      </Col>
    </Form.Group>
  );
};
