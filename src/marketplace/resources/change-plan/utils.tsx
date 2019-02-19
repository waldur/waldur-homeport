import { defaultCurrency } from '@waldur/core/services';
import { SelectDialogFieldColumn, SelectDialogFieldChoice } from '@waldur/form-react/SelectDialogField';
import { translate } from '@waldur/i18n';
import { getOffering, getResource } from '@waldur/marketplace/common/api';
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
  ...offering.components
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

const sortPlans = (plans: Plan[]) => plans.map(plan => ({
  ...plan, unit_price: parseFloat(plan.unit_price),
})).sort((a, b) => a.unit_price - b.unit_price);

const getChoices = (offering: Offering, resource: OrderItemResponse): SelectDialogFieldChoice[] =>
  sortPlans(offering.plans).map(plan => ({
    url: plan.url,
    uuid: plan.uuid,
    name: plan.name,
    ...plan.quotas,
    price: defaultCurrency(plan.unit_price),
    disabled: plan.url === resource.plan,
  }));

export async function loadData({ resource_uuid }): Promise<FetchedData> {
  const resource = await getResource(resource_uuid);
  const offering = await getOffering(resource.offering_uuid);
  const columns = getColumns(offering);
  const choices = getChoices(offering, resource);
  const validPlan = choices.find(choice => !choice.disabled);
  const initialValues = validPlan ? {plan: validPlan} : undefined;
  return {offering, resource, columns, choices, initialValues};
}
