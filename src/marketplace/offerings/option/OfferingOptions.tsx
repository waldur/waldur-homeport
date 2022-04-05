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
      <h3 className="content-center mt-3 mb-4">
        {translate(
          'If you want user to provide additional details when ordering, please configure input form for the user below',
        )}
      </h3>
      <Col sm={{ span: col, offset: offset }}>
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
      </Col>
    </Form.Group>
  );
};
