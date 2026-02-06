import { FORM_ERROR } from 'final-form';
import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceComponentUsagesSetUsage,
  marketplaceComponentUsagesSetUserUsage,
  type ComponentUsageCreateRequest,
  type ComponentUserUsageCreateRequest,
  type ResourcePlanPeriod,
  type BaseComponentUsage,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ResourceUsageForm } from './ResourceUsageForm';
import { ResourceUsageSubmitButton } from './ResourceUsageSubmitButton';
import { UsageReportContext } from './types';

interface Period {
  label: string;
  value: ResourcePlanPeriod | null;
}

interface OwnProps {
  components: OfferingComponent[];
  periods: Period[];
  params: UsageReportContext;
}

const mapComponents = (components: BaseComponentUsage[], userUsage = false) =>
  components.reduce(
    (collector, component) => ({
      ...collector,
      [component.type]: userUsage
        ? { uuid: component.uuid, amount: 0 }
        : {
            uuid: component.uuid,
            amount: component.usage ? parseFloat(component.usage) : 0,
            description: component.description,
            recurring: component.recurring,
          },
    }),
    {},
  );

export const ResourceUsageFormContainer: FunctionComponent<OwnProps> = (
  props,
) => {
  const dispatch = useDispatch();

  const initialValues = props.periods
    ? {
        period: props.periods[0],
        components: props.periods[0].value?.components
          ? mapComponents(
              props.periods[0].value.components,
              props.params.userUsage,
            )
          : undefined,
      }
    : {};

  const onSubmit = async ({ period, components, user, username }) => {
    const isUserUsage = props.params.userUsage;

    try {
      if (isUserUsage) {
        // Report user usage
        const promises = Object.keys(components).map((key) => {
          const requestBody: ComponentUserUsageCreateRequest = {
            usage: components[key].amount.toString(),
            user: user.url,
            username,
          };
          return marketplaceComponentUsagesSetUserUsage({
            path: { uuid: components[key].uuid },
            body: requestBody,
          });
        });
        await Promise.all(promises);
      } else {
        const usages = Object.keys(components).map((key) => ({
          type: key,
          amount: components[key].amount.toString(),
          description: components[key].description,
          recurring: components[key].recurring,
        }));
        // Report resource usage
        const requestBody: ComponentUsageCreateRequest = {
          plan_period: period.value?.uuid,
          resource: period.value?.uuid ? undefined : props.params.resource_uuid,
          usages,
        };
        await marketplaceComponentUsagesSetUsage({
          body: requestBody,
        });
      }
      dispatch(showSuccess(translate('Usage report has been submitted.')));
      dispatch(closeModalDialog());
    } catch (error: any) {
      // Show user-friendly error notification (existing pattern)
      dispatch(
        showErrorResponse(error, translate('Unable to submit usage report.')),
      );

      // Return form-level errors for React Final Form
      if (error.response?.status === 400 && error.response?.data) {
        return error.response.data; // Field-level validation errors
      }
      return { [FORM_ERROR]: translate('Unable to submit usage report.') };
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ResourceUsageForm
            components={props.components}
            periods={props.periods}
            params={props.params}
          />
          <div className="modal-footer">
            <ResourceUsageSubmitButton params={props.params} />
          </div>
        </form>
      )}
    />
  );
};
