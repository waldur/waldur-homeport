import { Button, Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { StepsList } from './StepsList';

import './wizard.css';

interface WizardFormProps {
  onSubmit(): void;
  submitting?: boolean;
  submitLabel: string;
  steps: string[];
  step: number;
  onPrev(): void;
}

export const WizardForm = reduxForm<{}, WizardFormProps>({
  form: 'CustomerCreateDialog',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})((props) => (
  <form onSubmit={props.handleSubmit(props.onSubmit)}>
    <Modal.Header>
      <Modal.Title>{translate('Create organization')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="wizard-big wizard clearfix">
        <StepsList steps={props.steps} step={props.step} />
        <h3>{props.steps[props.step]}</h3>
        <div className="content clearfix">{props.children}</div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      {props.step == 0 ? (
        <CloseDialogButton />
      ) : (
        <Button onClick={props.onPrev}>{translate('Previous')}</Button>
      )}
      <SubmitButton
        block={false}
        submitting={props.submitting}
        label={props.submitLabel}
      />
    </Modal.Footer>
  </form>
));
