import { useContext, useEffect } from 'react';
import { Col, Card, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { WrappedFieldArrayProps, FormSection, change } from 'redux-form';

import { FormLayoutContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { parseComponents } from '@waldur/marketplace/offerings/update/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

import { RemoveButton } from '../RemoveButton';

import { ComponentAddButton } from './ComponentAddButton';
import { ComponentForm } from './ComponentForm';

interface ComponentsListProps
  extends WrappedFieldArrayProps<OfferingComponent> {
  removeOfferingComponent(component: string): void;
  removeOfferingQuotas(component: string): void;
  builtinComponents: OfferingComponent[];
  isUpdatingOffering: boolean;
}

export const ComponentsList = (props: ComponentsListProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (props.builtinComponents.length > 0 && !props.isUpdatingOffering) {
      dispatch(
        change(FORM_ID, 'components', parseComponents(props.builtinComponents)),
      );
    }
  }, []);

  const { layout } = useContext(FormLayoutContext);

  const col = layout === 'vertical' ? 0 : 8;
  const offset = layout === 'vertical' ? 0 : 2;

  return (
    <Form.Group>
      <Col sm={{ span: col, offset: offset }} className="mb-2">
        <p>
          <strong>{translate('Plan components')}</strong>
        </p>
      </Col>

      <Col smOffset={offset} sm={col}>
        {props.fields.map((component, index) => (
          <Card key={index}>
            <Card.Header>
              <Card.Title>
                <h3>{translate('Component #{index}', { index: index + 1 })}</h3>
              </Card.Title>
              <div className="card-toolbar">
                {!props.builtinComponents.length && (
                  <RemoveButton
                    onClick={() => {
                      props.removeOfferingComponent(
                        props.fields.get(index).type,
                      );
                      props.fields.remove(index);
                    }}
                  />
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <FormSection name={component}>
                <ComponentForm
                  removeOfferingQuotas={() =>
                    props.removeOfferingQuotas(props.fields.get(index).type)
                  }
                  builtinComponents={props.builtinComponents}
                />
              </FormSection>
            </Card.Body>
          </Card>
        ))}
        {!props.builtinComponents.length && (
          <ComponentAddButton
            onClick={() => {
              props.fields.push({} as OfferingComponent);
            }}
          />
        )}
      </Col>
    </Form.Group>
  );
};
