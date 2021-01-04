import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  getFormComponent,
  getFormValidator,
} from '@waldur/marketplace/common/registry';
import { Offering, Plan } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { getDefaultLimits } from '../offerings/utils';

import { FORM_ID } from './constants';
import { OfferingFormData } from './types';

export interface PureOfferingConfiguratorProps {
  offering: Offering;
  project?: Project;
  plan?: Plan;
  limits: string[];
}

export const PureOfferingConfigurator = (
  props: PureOfferingConfiguratorProps & InjectedFormProps,
) => {
  const FormComponent = getFormComponent(props.offering.type);
  if (!FormComponent) {
    return null;
  }
  return <FormComponent {...props} />;
};

const storeConnector = connect<
  { project: Project },
  {},
  { offering: Offering; limits: string[] },
  RootState
>((state, ownProps) => ({
  project: getProject(state),
  initialValues: {
    limits: { ...getDefaultLimits(ownProps.offering), ...ownProps.limits },
  },
}));

export const validate = (_, props) => {
  const errors: any = {};
  if (!props.project) {
    errors.project = translate('This field is required');
  }
  if (props.values.plan && !props.values.plan.is_active) {
    errors.plan = translate('Plan capacity is full.');
  }
  const formValidator = getFormValidator(props.offering.type);
  if (formValidator) {
    Object.assign(errors, formValidator(props));
  }
  return errors;
};

const formConnector = reduxForm<
  OfferingFormData,
  PureOfferingConfiguratorProps
>({ form: FORM_ID, validate, touchOnChange: true });

const enhance = compose(storeConnector, formConnector);

export const OfferingConfigurator = enhance(PureOfferingConfigurator);
