import { ENV } from '@waldur/configs/default';
import { deleteById, sendForm } from '@waldur/core/api';

import { CategoryGroup } from '../../types';

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
