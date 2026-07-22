import {
  marketplaceCategoriesList,
  marketplaceProviderOfferingsList,
  marketplacePublicOfferingsList,
  Project,
} from 'waldur-js-client';

import { fetchResultCount, getAllPages, MAX_PAGE_SIZE } from '@/core/api';
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
        // accessible: keep the quick-add category list (and its offering_count)
        // in sync with the catalog by hiding offerings the current user cannot
        // order (e.g. restricted to roles they do not hold).
        accessible: true,
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
      // accessible: hide offerings the current user cannot order (matches the
      // catalog); skipped for the provider "importable" flow which lists the
      // provider's own offerings.
      ...(importable ? {} : { accessible: true }),
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
    // itemCount must be the TOTAL number of matching offerings (from the
    // 'x-result-count' header), not the length of this page. It seeds
    // InfiniteLoader's item count; using the page length made it believe
    // every item was already loaded, so categories with more than one page
    // of offerings never fetched pages 2+ and silently capped at page_size.
    const total = fetchResultCount(response);
    return {
      pageElements: response.data,
      itemCount: Number.isNaN(total) ? response.data.length : total,
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
        // accessible: hide offerings the current user cannot order (matches the
        // catalog) from the "Recently added offerings" quick-add shortcut.
        accessible: true,
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
