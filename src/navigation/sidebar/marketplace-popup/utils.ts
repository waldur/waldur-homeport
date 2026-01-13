import {
  marketplaceCategoriesList,
  marketplaceProviderOfferingsList,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE, parseSelectData } from '@waldur/core/api';
import { Category, Offering } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

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

export const fetchOfferingsByPage = (
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
  return api({
    query: {
      ...(customer ? { allowed_customer_uuid: customer.uuid } : {}),
      ...(project ? { project_uuid: project.uuid } : {}),
      ...(importable ? { importable: true } : {}),
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
  })
    .then(parseSelectData)
    .then((res) => ({
      pageElements: res.options,
      itemCount: res.totalItems,
    }));
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
          'customer_uuid',
          'category_title',
          'name',
          'description',
          'image',
          'state',
          'paused_reason',
        ],
        state: ['Active', 'Paused'],
        o: ['-created'],
      },
    })
  ).data as any as Offering[];
  return offerings;
};
