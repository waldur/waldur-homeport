import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { getFormComponent } from '@waldur/marketplace/common/registry';
import { Offering, Plan } from '@waldur/marketplace/types';
import { getProject } from '@waldur/workspace/selectors';
import { Project, OuterState } from '@waldur/workspace/types';

import { FORM_ID } from './constants';
import { OfferingFormData } from './types';

export interface PureOfferingConfiguratorProps {
  offering: Offering;
  project?: Project;
  plan?: Plan;
}

export const PureOfferingConfigurator = (props: PureOfferingConfiguratorProps & InjectedFormProps) => {
  const FormComponent = getFormComponent(props.offering.type);
  if (!FormComponent) {
    return null;
  }
  return <FormComponent {...props} />;
};

const storeConnector = connect<
  { project: Project },
  {},
  { offering: Offering },
  OuterState
>(state => ({ project: getProject(state) }));

export const validate = (_, props) => {
  const errors: any = {};
  if (!props.project) {
    errors.project = translate('This field is required');
  }
  return errors;
};

const formConnector = reduxForm<
  OfferingFormData,
  PureOfferingConfiguratorProps
>({ form: FORM_ID, validate, touchOnChange: true });

const enhance = compose(
  storeConnector,
  formConnector
);

export const OfferingConfigurator = enhance(PureOfferingConfigurator);
