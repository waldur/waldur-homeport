import {
  getCategories,
  getPublicOfferingsList,
  getPublicOfferingsOptions,
} from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { Customer, Project } from '@waldur/workspace/types';

export const fetchCategories = async (
  customer: Customer,
  project: Project,
  offering_name = '',
) => {
  return await getCategories({
    params: {
      ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
      ...(project ? { project_uuid: project.uuid } : {}),
      field: ['uuid', 'title', 'offering_count', 'icon', 'group'],
      has_offerings: true,
      offering_name,
    },
  });
};

export const fetchOfferingsByPage = (
  customer: Customer,
  project: Project,
  category: Category,
  search: string,
  page: number,
  pageSize: number,
) => {
  return getPublicOfferingsOptions({
    ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
    ...(project ? { project_uuid: project.uuid } : {}),
    category_uuid: category.uuid,
    name: search,
    field: [
      'uuid',
      'category_uuid',
      'customer_uuid',
      'category_title',
      'name',
      'description',
      'image',
      'state',
      'paused_reason',
    ],
    state: ['Active', 'Paused'],
    page,
    page_size: pageSize,
  }).then((res) => ({
    pageElements: res.options,
    itemCount: res.totalItems,
  }));
};

export const fetchLastNOfferings = async (
  customer: Customer,
  project: Project,
  page_size = 5,
) => {
  const offerings = await getPublicOfferingsList({
    page: 1,
    page_size,
    ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
    ...(project ? { project_uuid: project.uuid } : {}),
    field: [
      'uuid',
      'category_uuid',
      'customer_uuid',
      'category_title',
      'name',
      'description',
      'image',
      'state',
      'paused_reason',
    ],
    state: ['Active', 'Paused'],
    o: '-created',
  });
  return offerings;
};
