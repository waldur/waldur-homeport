import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OrderItemRequest } from '@waldur/marketplace/cart/types';
import { getFormSerializer, getFormLimitSerializer } from '@waldur/marketplace/common/registry';

import { Offering } from '../types';
import { OrderSummaryProps } from './types';

export const formatOrderItem = (props: OrderSummaryProps, request) => {
  const serializer = getFormSerializer(props.offering.type);
  const limitSerializer = getFormLimitSerializer(props.offering.type);
  if (props.formData) {
    request.plan = props.formData.plan;
    if (props.formData.attributes) {
      request.attributes = serializer(props.formData.attributes, props.offering);
    }
    if (props.formData.limits) {
      request.limits = limitSerializer(props.formData.limits);
    }
    const project = props.project || props.formData.project;
    if (project) {
      request.project = project.url;
    }
  }
  return request;
};

export const formatOrderItemForCreate = (props: OrderSummaryProps) => {
  const request: OrderItemRequest = {offering: props.offering};
  return formatOrderItem(props, request);
};

export const formatOrderItemForUpdate = (props: OrderSummaryProps) => {
  const request = {uuid: props.offering.uuid};
  return formatOrderItem(props, request);
};

export function updateBreadcrumbs(offering: Offering) {
  const $timeout = ngInjector.get('$timeout');
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  const WorkspaceService = ngInjector.get('WorkspaceService');
  const titleService = ngInjector.get('titleService');

  $timeout(() => {
    BreadcrumbsService.activeItem = offering.name;
    const data = WorkspaceService.getWorkspace();
    if (data.workspace === 'organization') {
      BreadcrumbsService.items = [
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
      BreadcrumbsService.items = [
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
    titleService.setTitle(offering.name);
  });
}
