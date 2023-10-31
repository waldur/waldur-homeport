import { ENV } from '@waldur/configs/default';
import { deleteById, sendForm } from '@waldur/core/api';

import { Category, CategoryGroup } from '../../types';

export const removeCategory = (uuid: string) =>
  deleteById('/marketplace-categories/', uuid);

export const createCategory = (data) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
    group: data.group,
  };
  return sendForm<Category>(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-categories/`,
    formData,
  );
};

export const updateCategory = (data, uuid) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
    group: data.group,
  };
  if (!formData.icon) {
    formData.icon = '';
  } else if (!(formData.icon instanceof File)) {
    formData.icon = undefined;
  }
  return sendForm<Category>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-categories/${uuid}/`,
    formData,
  );
};

export const removeCategoryGroup = (uuid: string) =>
  deleteById('/marketplace-category-groups/', uuid);

export const createCategoryGroup = (data) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
  };
  return sendForm<CategoryGroup>(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-category-groups/`,
    formData,
  );
};

export const updateCategoryGroup = (data, uuid) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
  };
  if (!formData.icon) {
    formData.icon = '';
  } else if (!(formData.icon instanceof File)) {
    formData.icon = undefined;
  }
  return sendForm<CategoryGroup>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-category-groups/${uuid}/`,
    formData,
  );
};
