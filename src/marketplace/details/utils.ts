import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OrderItemRequest } from '@waldur/marketplace/cart/types';
import {
  getFormSerializer,
  getFormLimitSerializer,
} from '@waldur/marketplace/common/registry';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import store from '@waldur/store/store';
import { getWorkspace } from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
  USER_WORKSPACE,
} from '@waldur/workspace/types';

import { Offering } from '../types';

import { FORM_ID } from './constants';
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
        const limitedComponents = props.offering.components
          .filter((c) => c.billing_type === 'limit')
          .map((c) => c.type);
        // Filter out disabled plan quotas
        request.limits = {
          ...Object.keys(planQuotas).reduce(
            (acc, key) =>
              limitedComponents.includes(key)
                ? { ...acc, [key]: planQuotas[key] }
                : acc,
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
    if (props.formData.project_create_request) {
      request.project_create_request = props.formData.project_create_request;
    }
    if (props.formData.customer_create_request) {
      request.customer_create_request = props.formData.customer_create_request;
    }
    if (props.formData.customer) {
      request.customer = props.formData.customer;
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
  } else if (workspace === PROJECT_WORKSPACE) {
    return [
      {
        label: translate('Project workspace'),
        state: 'project.details',
      },
      {
        label: translate('Marketplace'),
        state: 'marketplace-landing-project',
      },
      {
        label: offering.category_title,
        state: 'marketplace-category-project',
        params: {
          category_uuid: offering.category_uuid,
        },
      },
    ];
  } else if (workspace === USER_WORKSPACE) {
    return [
      {
        label: translate('User workspace'),
        state: 'profile.details',
      },
      {
        label: translate('Marketplace'),
        state: 'marketplace-landing-user',
      },
      {
        label: offering.category_title,
        state: 'marketplace-category-user',
        params: {
          category_uuid: offering.category_uuid,
        },
      },
    ];
  }
}

export const formSelector = formValueSelector(FORM_ID);
