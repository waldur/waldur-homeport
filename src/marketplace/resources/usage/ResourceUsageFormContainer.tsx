import { FORM_ERROR } from 'final-form';
import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceComponentUsagesSetUsage,
  marketplaceComponentUsagesSetUserUsage,
  ComponentUsageCreateRequest,
  ComponentUserUsageCreateRequest,
  ResourcePlanPeriod,
  BaseComponentUsage,
  OfferingComponent,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

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
            missing_usage_policy: component.missing_usage_policy || 'none',
          },
    }),
    {},
  );

export const ResourceUsageFormContainer: FunctionComponent<OwnProps> = (
  props,
) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const { closeDialog } = useModal();

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
          missing_usage_policy: components[key].missing_usage_policy,
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
      showSuccess(translate('Usage report has been submitted.'));
      closeDialog();
    } catch (error: any) {
      // Show user-friendly error notification (existing pattern)
      showErrorResponse(error, translate('Unable to submit usage report.'));

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
