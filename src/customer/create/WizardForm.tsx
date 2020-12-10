import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { StepsList } from './StepsList';

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
    <ModalHeader>
      <ModalTitle>{translate('Create organization')}</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <div className="wizard-big wizard clearfix">
        <StepsList steps={props.steps} step={props.step} />
        <h3>{props.steps[props.step]}</h3>
        <div className="content clearfix">{props.children}</div>
      </div>
    </ModalBody>
    <ModalFooter>
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
    </ModalFooter>
  </form>
));
