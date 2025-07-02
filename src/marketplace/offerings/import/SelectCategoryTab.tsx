import { QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, FieldArray, WrappedFieldArrayProps } from 'redux-form';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { required, requiredArray } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useCategories } from '@waldur/marketplace/category/useCategories';
import { Category, Offering } from '@waldur/marketplace/types';

import { importOfferingSelector } from './selectors';

interface FieldValue {
  remote_category?;
  local_category?;
}

const FieldsListMapping = ({
  fields,
  offerings,
  categories,
}: WrappedFieldArrayProps<FieldValue> & {
  offerings: Offering[];
  categories: Category[];
}) => {
  return (
    <Form.Group>
      <table className="table align-middle table-row-bordered border-bottom mb-3">
        <thead>
          <tr className="text-muted fs-7 fw-bold">
            <td className="w-50">{translate('Remote category')}</td>
            <td className="w-50">{translate('Local category')}</td>
          </tr>
        </thead>
        <tbody className="fs-6">
          {fields.map((component, i) =>
            component ? (
              <tr key={component}>
                <td className="text-dark">
                  {fields.get(i).remote_category}
                  <Tip
                    id={`tip-offerings-${component}`}
                    label={
                      <>
                        <p className="fw-bold text-start mb-1">
                          {translate('Offerings')}
                        </p>
                        <ul className="mb-0">
                          {offerings
                            .filter(
                              (item) =>
                                item.category_title ===
                                fields.get(i).remote_category,
                            )
                            .map((offering) => (
                              <li key={offering.uuid}>{offering.name}</li>
                            ))}
                        </ul>
                      </>
                    }
                  >
                    <QuestionIcon
                      size={20}
                      className="text-gray-500 cursor-pointer text-hover-muted ms-2"
                    />
                  </Tip>
                </td>
                <td>
                  <Field
                    component={SelectField}
                    name={`${component}.local_category`}
                    options={categories || []}
                    getOptionValue={(option) => option.uuid}
                    getOptionLabel={(option) => option.title}
                    validate={required}
                  />
                </td>
              </tr>
            ) : null,
          )}
        </tbody>
      </table>
    </Form.Group>
  );
};

export const SelectCategoryTab = () => {
  useCategories;
  const {
    isLoading,
    data: categories,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],

    queryFn: () =>
      getAllPages((page) =>
        marketplaceCategoriesList({
          query: { page, field: ['uuid', 'title', 'group'], page_size: 100 },
        }),
      ),

    staleTime: 3 * 60 * 1000,
  });
  const formData = useSelector(importOfferingSelector);

  return (
    <>
      <FieldArray
        name="categories_set"
        component={FieldsListMapping}
        validate={requiredArray}
        offerings={formData.offerings}
        categories={categories}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          loadData={refetch}
          message={translate('Unable to load categories')}
        />
      ) : categories.length === 0 ? (
        <>{translate('There are no categories yet.')}</>
      ) : null}
    </>
  );
};
