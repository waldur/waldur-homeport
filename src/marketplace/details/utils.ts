import { translate } from '@waldur/i18n';
import { OrderItemRequest } from '@waldur/marketplace/cart/types';
import {
  getFormSerializer,
  getFormLimitSerializer,
} from '@waldur/marketplace/common/registry';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import store from '@waldur/store/store';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { Offering } from '../types';

import { OrderSummaryProps } from './types';

export const formatOrderItem = (props: OrderSummaryProps, request) => {
  const serializer = getFormSerializer(props.offering.type);
  const limitSerializer = getFormLimitSerializer(props.offering.type);
  if (props.formData) {
    request.plan = props.formData.plan;
    if (props.formData.attributes) {
      request.attributes = serializer(
        props.formData.attributes,
        props.offering,
      );
    }
    if (props.formData.limits) {
      if (props.formData.plan && props.formData.plan.quotas) {
        const planQuotas = props.formData.plan.quotas;
        const disabledComponents = props.offering.components
          .filter((c) => c.disable_quotas)
          .map((c) => c.type);
        const nonUsageComponents = props.offering.components
          .filter((c) => c.billing_type !== 'usage')
          .map((c) => c.type);
        const invalidComponents = [
          ...nonUsageComponents,
          ...disabledComponents,
        ];
        // Filter out disabled plan quotas
        request.limits = {
          ...Object.keys(planQuotas).reduce(
            (acc, key) =>
              invalidComponents.includes(key)
                ? acc
                : { ...acc, [key]: planQuotas[key] },
            {},
          ),
        };
      }
      request.limits = {
        ...request.limits,
        ...limitSerializer(props.formData.limits),
      };
    }
    const project = props.project || props.formData.project;
    if (project) {
      request.project = project.url;
    }
  }
  return request;
};

export const formatOrderItemForCreate = (props: OrderSummaryProps) => {
  const request: OrderItemRequest = { offering: props.offering };
  return formatOrderItem(props, request);
};

export const formatOrderItemForUpdate = (props: OrderSummaryProps) => {
  const request = { uuid: props.offering.uuid };
  return formatOrderItem(props, request);
};

export function getBreadcrumbs(offering: Offering): BreadcrumbItem[] {
  const workspace = getWorkspace(store.getState());
  if (workspace === ORGANIZATION_WORKSPACE) {
    return [
      {
        label: translate('Organization workspace'),
        state: 'organization.details',
      },
      {
        label: translate('Marketplace'),
        state: 'marketplace-landing-customer',
      },
      {
        label: offering.category_title,
        state: 'marketplace-category-customer',
        params: {
          category_uuid: offering.category_uuid,
        },
      },
    ];
  } else {
    return [
      {
        label: translate('Project workspace'),
        state: 'project.details',
      },
      {
        label: translate('Marketplace'),
        state: 'marketplace-landing',
      },
      {
        label: offering.category_title,
        state: 'marketplace-category',
        params: {
          category_uuid: offering.category_uuid,
        },
      },
    ];
  }
}
