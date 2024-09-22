import { FC } from 'react';
import { AsyncState } from 'react-use/lib/useAsync';
import { FieldArray, InjectedFormProps, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Category, CategoryColumn } from '@waldur/marketplace/types';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';

import { ColumnsList } from './ColumnsList';

interface ParentProps {
  asyncState: AsyncState<{ columns: any[] }>;
  submitRequest: (formData: FormData) => Promise<void>;
  category: Category;
  dispatch: any;
}

interface FormData {
  columns: CategoryColumn[];
}

type Props = InjectedFormProps<FormData, ParentProps> & ParentProps;

const CategoryColumnsFormComponent: FC<Props> = ({
  handleSubmit,
  submitting,
  invalid,
  asyncState,
  category,
  submitRequest,
  dispatch,
}) => {
  if (asyncState.loading) {
    return <p>{translate('Loading...')}</p>;
  }

  if (asyncState.error) {
    return <p>{translate('Error loading columns.')}</p>;
  }

  return (
    <form onSubmit={handleSubmit(submitRequest)}>
      <AsyncActionDialog
        title={translate('Set columns in {name} category', {
          name: category.title,
        })}
        loading={asyncState.loading}
        error={asyncState.error}
        submitting={submitting}
        invalid={invalid}
      >
        {asyncState.value?.columns ? (
          <FieldArray
            name="columns"
            component={ColumnsList}
            CategoryColumns={asyncState.value.columns}
            dispatch={dispatch}
          />
        ) : null}
      </AsyncActionDialog>
    </form>
  );
};

export const CategoryColumnsForm = reduxForm<FormData, ParentProps>({
  form: 'CategoryColumnsEdit',
  enableReinitialize: true,
})(CategoryColumnsFormComponent);
