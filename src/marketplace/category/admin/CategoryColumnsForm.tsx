import { UseQueryResult } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { CategoryColumn } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { ColumnsList } from './ColumnsList';

interface CategoryColumnsFormProps {
  asyncState: UseQueryResult<CategoryColumn[]>;
  submitRequest: (formData: FormData) => Promise<void>;
  category: Category;
  initialValues?: FormData;
}

interface FormData {
  columns: CategoryColumn[];
}

export const CategoryColumnsForm: FC<CategoryColumnsFormProps> = ({
  asyncState,
  category,
  submitRequest,
  initialValues = { columns: [] },
}) => {
  if (asyncState.isLoading) {
    return <p>{translate('Loading...')}</p>;
  }

  if (asyncState.error) {
    return <p>{translate('Error loading columns.')}</p>;
  }

  return (
    <Form
      mutators={{ ...arrayMutators }}
      onSubmit={submitRequest}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Set columns in {name} category', {
              name: category.title,
            })}
            loading={asyncState.isLoading}
            error={asyncState.error}
          >
            {asyncState.data ? (
              <FieldArray name="columns">
                {(props) => (
                  <ColumnsList
                    {...props}
                    CategoryColumns={asyncState.data}
                    category={category}
                  />
                )}
              </FieldArray>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
