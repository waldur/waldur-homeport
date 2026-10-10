import { FORM_ERROR } from 'final-form';
import { FunctionComponent, ReactNode } from 'react';
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
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ResourceUsageForm } from './ResourceUsageForm';
import { ResourceUsageSubmitButton } from './ResourceUsageSubmitButton';
import { UsageReportContext } from './types';

interface Period {
  label: string;
  value: ResourcePlanPeriod | null;
}

interface OwnProps {
  title: ReactNode;
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

  const mutation = useManagedMutation({
    mutationFn: async ({ period, components, user, username }) => {
      const isUserUsage = props.params.userUsage;

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
    },
    successMessage: translate('Usage report has been submitted.'),
    errorMessage: translate('Unable to submit usage report.'),
    refetch: props.params.refetch,
    // The usage history chart has its own query, which the resource refetch
    // doesn't reach.
    invalidateQueries: [{ queryKey: ['UsageCard'] }],
  });

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error: any) {
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
          <ModalDialog
            title={props.title}
            footer={<ResourceUsageSubmitButton params={props.params} />}
          >
            <ResourceUsageForm
              components={props.components}
              periods={props.periods}
              params={props.params}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
