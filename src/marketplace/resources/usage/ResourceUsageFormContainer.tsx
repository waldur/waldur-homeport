import { connect } from 'react-redux';
import { compose } from 'redux';
import { change, reduxForm } from 'redux-form';
import {
  marketplaceComponentUsagesSetUsage,
  marketplaceComponentUsagesSetUserUsage,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { FORM_ID } from '../store/constants';

import { ResourceUsageForm } from './ResourceUsageForm';
import { UsageReportContext, ComponentUsage } from './types';

interface OwnProps {
  components: OfferingComponent[];
  periods: any;
  params: UsageReportContext;
}

const mapComponents = (components: ComponentUsage[], userUsage = false) =>
  components.reduce(
    (collector, component) => ({
      ...collector,
      [component.type]: userUsage
        ? { uuid: component.uuid, amount: 0 }
        : {
            uuid: component.uuid,
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
            ? mapComponents(
                ownProps.periods[0].value.components,
                ownProps.params.userUsage,
              )
            : undefined,
        },
      }
    : {};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onPeriodChange: (option) => {
    const period = option.value;
    for (const component of period.components) {
      dispatch(
        change(FORM_ID, `components.${component.type}.amount`, component.usage),
      );
      dispatch(
        change(
          FORM_ID,
          `components.${component.type}.description`,
          component.description,
        ),
      );
    }
  },
  submitReport: async ({ period, components, user, username }) => {
    const isUserUsage = ownProps.params.userUsage;

    try {
      if (isUserUsage) {
        // Report user usage
        const promises = Object.keys(components).map((key) => {
          return marketplaceComponentUsagesSetUserUsage({
            path: { uuid: components[key].uuid },
            body: {
              usage: components[key].amount,
              user: user.url,
              username,
            },
          });
        });
        await Promise.all(promises);
      } else {
        const usages = Object.keys(components).map((key) => ({
          type: key,
          ...components[key],
        }));
        // Report resource usage
        await marketplaceComponentUsagesSetUsage({
          body: {
            plan_period: period.value?.uuid,
            usages,
          },
        });
      }
      dispatch(showSuccess(translate('Usage report has been submitted.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to submit usage report.')),
      );
    }
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const enhance = compose(connector, reduxForm({ form: FORM_ID }));

export const ResourceUsageFormContainer = enhance(ResourceUsageForm);
