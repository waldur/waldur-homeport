import { FC } from 'react';

import { useCategoryColumnsEditor } from '../utils';

import { CategoryColumnsForm } from './CategoryColumnsForm';

interface CategoryManageColumnsDialogProps {
  resolve: {
    category: any;
  };
}

export const CategoryManageColumnsDialog: FC<
  CategoryManageColumnsDialogProps
> = ({ resolve: { category } }) => {
  const formState = useCategoryColumnsEditor(category);
  return (
    <CategoryColumnsForm
      asyncState={formState.asyncState}
      submitRequest={formState.submitRequest}
      category={formState.category}
      initialValues={formState.initialValues}
      dispatch={formState.dispatch}
    />
  );
};
