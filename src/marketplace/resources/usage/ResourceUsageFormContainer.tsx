import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { OfferingComponent } from '@waldur/marketplace/types';

import { periodChanged } from '../store/actions';
import { submitUsage, FORM_ID } from '../store/constants';

import { ResourceUsageForm } from './ResourceUsageForm';
import { UsageReportContext, ComponentUsage } from './types';

interface OwnProps {
  components: OfferingComponent[];
  periods: any;
  params: UsageReportContext;
}

const mapComponents = (components: ComponentUsage[]) =>
  components.reduce(
    (collector, component) => ({
      ...collector,
      [component.type]: {
        amount: component.usage,
        description: component.description,
        recurring: component.recurring,
      },
    }),
    {},
  );

const mapStateToProps = (_, ownProps: OwnProps) =>
  ownProps.periods
    ? {
        initialValues: {
          period: ownProps.periods[0],
          components: ownProps.periods[0].value
            ? mapComponents(ownProps.periods[0].value.components)
            : undefined,
        },
      }
    : {};

const mapDispatchToProps = (dispatch) => ({
  submitReport: (data) => submitUsage(data, dispatch),
  onPeriodChange: (option) => dispatch(periodChanged(option.value)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const enhance = compose(connector, reduxForm({ form: FORM_ID }));

export const ResourceUsageFormContainer = enhance(ResourceUsageForm);
