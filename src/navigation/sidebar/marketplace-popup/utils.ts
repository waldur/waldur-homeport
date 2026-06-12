import {
  marketplaceCategoriesList,
  marketplaceProviderOfferingsList,
  marketplacePublicOfferingsList,
  Project,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { Category } from '@/marketplace/types';
import { Customer } from '@/workspace/types';

export const fetchCategories = (
  customer: Customer,
  project: Project,
  offering_name = '',
) =>
  getAllPages((page) =>
    marketplaceCategoriesList({
      query: {
        page,
        page_size: MAX_PAGE_SIZE,
        ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
        ...(project ? { project_uuid: project.uuid } : {}),
        field: ['uuid', 'title', 'offering_count', 'icon', 'group'],
        offering_name,
      },
    }),
  );

export const fetchOfferingsByPage = async (
  customer: Customer,
  project: Project,
  category: Category,
  search: string,
  page: number,
  pageSize: number,
  importable: boolean = false,
) => {
  const api = importable
    ? marketplaceProviderOfferingsList
    : marketplacePublicOfferingsList;
  const response = await api({
    query: {
      ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
      ...(project ? { project_uuid: project.uuid } : {}),
      ...(importable ? { importable: 'true' } : {}),
      category_uuid: category.uuid,
      name: search,
      field: [
        'uuid',
        'category_uuid',
        'category_title',
        'customer_uuid',
        'customer_name',
        'name',
        'description',
        'image',
        'state',
        'paused_reason',
        'plans',
      ],
      state: ['Active', 'Paused'],
      page,
      page_size: pageSize,
    },
  });
  if (Array.isArray(response.data)) {
    return {
      pageElements: response.data,
      itemCount: response.data.length,
    };
  } else {
    return {
      pageElements: [],
      itemCount: 0,
    };
  }
};

export const fetchLastNOfferings = async (
  customer: Customer,
  project: Project,
  page_size = 5,
) => {
  const offerings = (
    await marketplacePublicOfferingsList({
      query: {
        page: 1,
        page_size,
        ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
        ...(project ? { project_uuid: project.uuid } : {}),
        field: [
          'uuid',
          'category_uuid',
          'category_title',
          'customer_uuid',
          'customer_name',
          'name',
          'description',
          'image',
          'state',
          'paused_reason',
          'plans',
        ],
        state: ['Active', 'Paused'],
        o: ['-created'],
      },
    })
  ).data;
  return offerings;
};
