import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { AsyncState } from 'react-use/lib/useAsync';
import { CategoryColumn } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { ColumnsList } from './ColumnsList';

interface CategoryColumnsFormProps {
  asyncState: AsyncState<CategoryColumn[]>;
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
  if (asyncState.loading) {
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
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Set columns in {name} category', {
              name: category.title,
            })}
            loading={asyncState.loading}
            error={asyncState.error}
            submitting={submitting}
            invalid={invalid}
          >
            {asyncState.value ? (
              <FieldArray name="columns">
                {(props) => (
                  <ColumnsList
                    {...props}
                    CategoryColumns={asyncState.value}
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
