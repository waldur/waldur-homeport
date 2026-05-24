import { FC } from 'react';

import { Category } from '@/marketplace/types';

import { useCategoryColumnsEditor } from '../utils';

import { CategoryColumnsForm } from './CategoryColumnsForm';

interface CategoryManageColumnsDialogProps {
  resolve: {
    category: Category;
  };
}

export const CategoryManageColumnsDialog: FC<
  CategoryManageColumnsDialogProps
> = ({ resolve: { category } }) => {
  const formState = useCategoryColumnsEditor(category);
  return (
    <CategoryColumnsForm
      asyncState={{
        loading: formState.asyncState.isLoading as any,
        error: formState.asyncState.error,
        value: formState.asyncState.data,
      }}
      submitRequest={formState.submitRequest}
      category={formState.category}
      initialValues={formState.initialValues}
    />
  );
};
