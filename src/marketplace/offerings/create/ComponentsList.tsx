import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import { WrappedFieldArrayProps, FormSection } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { RemoveButton } from '../RemoveButton';

import { ComponentAddButton } from './ComponentAddButton';
import { ComponentForm } from './ComponentForm';

interface ComponentsListProps
  extends TranslateProps,
    WrappedFieldArrayProps<OfferingComponent> {
  removeOfferingComponent(component: string): void;
  removeOfferingQuotas(component: string): void;
}

export const ComponentsList = withTranslation((props: ComponentsListProps) => (
  <div className="form-group">
    <Col smOffset={2} sm={8} className="m-b-sm">
      <p className="form-control-static">
        <strong>{props.translate('Plan components')}</strong>
      </p>
    </Col>

    <Col smOffset={2} sm={8}>
      {props.fields.map((component, index) => (
        <Panel key={index}>
          <Panel.Heading>
            <RemoveButton
              onClick={() => {
                props.removeOfferingComponent(props.fields.get(index).type);
                props.fields.remove(index);
              }}
            />
            <h4>
              {props.translate('Component #{index}', { index: index + 1 })}
            </h4>
          </Panel.Heading>
          <Panel.Body>
            <FormSection name={component}>
              <ComponentForm
                removeOfferingQuotas={() =>
                  props.removeOfferingQuotas(props.fields.get(index).type)
                }
              />
            </FormSection>
          </Panel.Body>
        </Panel>
      ))}
      <ComponentAddButton
        onClick={() => {
          props.fields.push({} as OfferingComponent);
        }}
      />
    </Col>
  </div>
));
