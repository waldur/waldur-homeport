import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { useFullPage } from '@waldur/navigation/context';

import { InjectedVStepperFormSidebarProps } from './VStepperFormSidebar';
import { VStepperFormStep } from './VStepperFormStep';

import './VStepperForm.scss';

interface VStepperFormProps {
  form: InjectedFormProps['form'];
  children: any;
  initialValues?: InjectedFormProps['initialValues'];
  onSubmit?(formData, dispatch, formProps): Promise<any> | void;
  sidebar: React.ComponentType<InjectedVStepperFormSidebarProps>;
  steps: VStepperFormStep[];
  completedSteps?: boolean[];
  validate?(values: any): any;
  noPaddingTop?: boolean;
}

interface OwnProps
  extends VStepperFormProps,
    Omit<InjectedFormProps, 'initialValues'> {
  formValues: any;
  submit(): void;
}

const VStepperFormPure: React.FC<OwnProps> = (props) => {
  useFullPage();
  return (
    <form
      className="v-stepper-form form d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10"
      onSubmit={props.onSubmit && props.handleSubmit(props.onSubmit)}
    >
      {/* Steps container */}
      <div
        className={
          'v-stepper-form-steps container-xxl pe-xl-0 d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7' +
          (props.noPaddingTop ? '' : ' pt-10')
        }
      >
        {props.children}
      </div>

      {/* Sidebar */}
      {React.createElement(props.sidebar, {
        steps: props.steps,
        completedSteps: props.completedSteps,
        submitting: props.submitting,
      })}
    </form>
  );
};

export const VStepperForm = compose(
  connect((_, ownProps: VStepperFormProps) => {
    return {
      form: ownProps.form,
      initialValues: ownProps.initialValues,
      validate: ownProps.validate,
    };
  }),
  reduxForm({
    touchOnChange: true,
  }),
)(VStepperFormPure);
