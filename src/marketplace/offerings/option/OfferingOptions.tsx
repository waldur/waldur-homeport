import { FC, useContext } from 'react';
import { Col, Panel } from 'react-bootstrap';

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
    <div className="form-group">
      <h3 className="content-center m-t-md m-b-lg">
        {translate(
          'If you want user to provide additional details when ordering, please configure input form for the user below',
        )}
      </h3>
      <Col sm={{ span: col, offset: offset }}>
        {props.fields.map((option, index) => (
          <Panel key={index}>
            <Panel.Heading>
              <RemoveButton
                onClick={() => props.fields.remove(index)}
                disabled={props.readOnly}
              />
              <h4>
                {translate('User input field #{index}', {
                  index: index + 1,
                })}
              </h4>
            </Panel.Heading>
            <Panel.Body>
              <OptionForm option={option} readOnly={props.readOnly} />
            </Panel.Body>
          </Panel>
        ))}
        <AddOptionButton
          onClick={() => props.fields.push({})}
          disabled={props.readOnly}
        >
          {translate('Add user input field')}
        </AddOptionButton>
      </Col>
    </div>
  );
};
