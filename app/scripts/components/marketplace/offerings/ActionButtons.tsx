import * as React from 'react';

import { SubmitButton } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';

import { OfferingStep } from './types';

interface ActionButtonsProps extends TranslateProps {
  step: OfferingStep;
  setStep(state: OfferingStep): void;
  gotoOfferingList(): void;
  invalid: boolean;
  submitting: boolean;
}

const goBack = (props: ActionButtonsProps) => () => {
  if (props.step === 'Configure') {
    props.setStep('Describe');
  }
  if (props.step === 'Describe') {
    props.gotoOfferingList();
  }
};

export const ActionButtons = (props: ActionButtonsProps) => (
  <div className="display-flex justify-content-between m-t-md">
    <a className="btn btn-outline btn-default" onClick={goBack(props)}>
      <i className="fa fa-arrow-left"/>
      {' '}
      {props.translate('Back')}
    </a>
    {props.step === 'Describe' && (
      <a className="btn btn-primary" onClick={() => props.setStep('Configure')}>
        {props.translate('Configure')}
        {' '}
        <i className="fa fa-arrow-right"/>
      </a>
    )}
    {props.step === 'Configure' && (
      <SubmitButton
        disabled={props.invalid}
        submitting={props.submitting}
        label={props.translate('Submit')}
      />
    )}
  </div>
);
