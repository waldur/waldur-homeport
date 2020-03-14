import { defaultCurrency } from '@waldur/core/services';
import {
  SelectDialogFieldColumn,
  SelectDialogFieldChoice,
} from '@waldur/form-react/SelectDialogField';
import { translate } from '@waldur/i18n';
import { getOffering, getResource } from '@waldur/marketplace/common/api';
import { filterOfferingComponents } from '@waldur/marketplace/common/registry';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering, Plan } from '@waldur/marketplace/types';

export interface FetchedData {
  resource: OrderItemResponse;
  offering: Offering;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  initialValues: {
    plan: SelectDialogFieldChoice;
  };
}

const getColumns = (offering: Offering): SelectDialogFieldColumn[] => [
  {
    name: 'name',
    label: translate('Name'),
  },
  ...filterOfferingComponents(offering)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(component => ({
      name: component.type,
      label: component.name,
    })),
  {
    name: 'price',
    label: translate('Price'),
  },
];

const sortPlans = (plans: Plan[]) =>
  plans
    .map(plan => ({
      ...plan,
      unit_price:
        typeof plan.unit_price === 'string'
          ? parseFloat(plan.unit_price)
          : plan.unit_price,
    }))
    .sort((a, b) => a.unit_price - b.unit_price);

const getPlanSwitchPrice = (plan: Plan) => {
  const fixedPart =
    typeof plan.unit_price === 'string'
      ? parseFloat(plan.unit_price)
      : plan.unit_price;
  const switchPart =
    typeof plan.switch_price === 'string'
      ? parseFloat(plan.switch_price)
      : plan.switch_price;
  return defaultCurrency(fixedPart + switchPart);
};

const getChoices = (
  offering: Offering,
  resource: OrderItemResponse,
): SelectDialogFieldChoice[] =>
  sortPlans(offering.plans).map(plan => ({
    url: plan.url,
    uuid: plan.uuid,
    name: plan.name,
    ...plan.quotas,
    archived: plan.archived,
    price: getPlanSwitchPrice(plan),
    disabled: plan.url === resource.plan || !plan.is_active,
    disabledReason: !plan.is_active
      ? translate('Plan capacity is full.')
      : plan.url === resource.plan
      ? translate('Resource already has this plan.')
      : undefined,
  }));

export async function loadData({ resource_uuid }): Promise<FetchedData> {
  const resource = await getResource(resource_uuid);
  const offering = await getOffering(resource.offering_uuid);
  const columns = getColumns(offering);
  const choices = getChoices(offering, resource);
  const validPlan = choices.find(choice => !choice.disabled);
  const initialValues = validPlan ? { plan: validPlan } : undefined;
  return { offering, resource, columns, choices, initialValues };
}
