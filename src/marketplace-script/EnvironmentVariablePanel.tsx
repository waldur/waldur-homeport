import { FunctionComponent } from 'react';
import { Panel } from 'react-bootstrap';
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
  <Panel>
    <Panel.Heading>
      <RemoveButton onClick={() => props.onRemove(props.index)} />
      <h4>{translate('Variable #{index}', { index: props.index + 1 })}</h4>
    </Panel.Heading>
    <Panel.Body>
      <FormSection name={props.variable}>
        <FormGroup label={translate('Name')} required={true}>
          <Field name="name" component="input" className="form-control" />
        </FormGroup>
        <FormGroup label={translate('Value')} required={true}>
          <Field name="value" component="input" className="form-control" />
        </FormGroup>
      </FormSection>
    </Panel.Body>
  </Panel>
);
