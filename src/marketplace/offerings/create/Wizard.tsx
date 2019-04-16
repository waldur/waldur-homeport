import * as classNames from 'classnames';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';

import { SubmitButton } from '@waldur/form-react';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { StepsList } from '@waldur/marketplace/common/StepsList';
import ActionButton from '@waldur/table-react/ActionButton';

interface WizardProps extends TranslateProps {
  steps: string[];
  step: string;
  setStep?(step: string): void;
  goBack(): void;
  goNext(): void;
  submitting: boolean;
  invalid: boolean;
  isLastStep: boolean;
  tabs: {[key: string]: React.ComponentType};
  submitLabel?: string;
}

export const Wizard = withTranslation((props: WizardProps) => (
  <>
    <StepsList
      choices={props.steps}
      value={props.step}
      onClick={props.setStep}
      disabled={props.submitting}
    />
    {React.createElement(props.tabs[props.step])}
    <div className="form-group">
      <Col smOffset={2} sm={8}>
        <div className="display-flex justify-content-between m-t-md">
          <ActionButton
            title={props.translate('Back')}
            action={props.goBack}
            icon="fa fa-arrow-left"
            className={classNames({disabled: props.submitting}, 'btn btn-outline btn-default')}
          />
          {!props.isLastStep && (
            <ActionButton
              disabled={props.invalid}
              title={props.translate('Next')}
              action={props.goNext}
              icon="fa fa-arrow-right"
              className="btn btn-primary"
            />
          )}
          {props.isLastStep && (
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={props.submitLabel || props.translate('Submit')}
            />
          )}
        </div>
      </Col>
    </div>
  </>
));
