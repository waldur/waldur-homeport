import { FunctionComponent } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Field, FormSection } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { RemoveButton } from '@waldur/marketplace/offerings/RemoveButton';

interface OwnProps {
  index: number;
  variable: string;
  onRemove(index: number): void;
}

export const EnvironmentVariablePanel: FunctionComponent<OwnProps> = (
  props,
) => (
  <Card>
    <Card.Header>
      <Card.Title>
        <h3>{translate('Variable #{index}', { index: props.index + 1 })}</h3>
      </Card.Title>
      <RemoveButton onClick={() => props.onRemove(props.index)} />
    </Card.Header>
    <Card.Body>
      <FormSection name={props.variable}>
        <FormGroup label={translate('Name')} required={true}>
          <Field name="name" component={Form.Control} />
        </FormGroup>
        <FormGroup label={translate('Value')} required={true}>
          <Field name="value" component={Form.Control} />
        </FormGroup>
      </FormSection>
    </Card.Body>
  </Card>
);
