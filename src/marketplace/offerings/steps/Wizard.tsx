import React from 'react';
import { Col, Form } from 'react-bootstrap';

import { StepsList } from '@waldur/marketplace/common/StepsList';

import { WizardButtons } from './WizardButtons';
import { WizardTabs } from './WizardTabs';

interface WizardProps {
  steps: string[];
  step: string;
  setStep?(step: string): void;
  goBack(): void;
  goNext(): void;
  submitting: boolean;
  invalid: boolean;
  isLastStep: boolean;
  tabs: { [key: string]: React.ComponentType<any> };
  submitLabel?: string;
  mountOnEnter?: boolean;
  getTabLabel(tab: string): string;
}

export const Wizard = (props: WizardProps) => (
  <>
    <StepsList
      choices={props.steps}
      value={props.step}
      onClick={props.setStep}
      disabled={props.submitting}
      getTabLabel={props.getTabLabel}
    />
    <WizardTabs
      steps={props.steps}
      currentStep={props.step}
      tabs={props.tabs}
      mountOnEnter={props.mountOnEnter}
    />
    <Form.Group>
      <Col sm={{ span: 8, offset: 2 }}>
        <WizardButtons
          isLastStep={props.isLastStep}
          goBack={props.goBack}
          goNext={props.goNext}
          submitting={props.submitting}
          invalid={props.invalid}
          submitLabel={props.submitLabel}
        />
      </Col>
    </Form.Group>
  </>
);
