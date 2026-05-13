import { QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Form } from 'react-bootstrap';
import { Field, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { required, requiredArray } from '@/core/validators';
import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { Category, Offering } from '@/marketplace/types';

import { OfferingImportFormData } from './types';

const FieldsListMapping = ({
  fields,
  offerings,
  categories,
}: {
  fields: any;
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
                  {fields.value[i].remote_category}
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
                                fields.value[i].remote_category,
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
                      weight="bold"
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
          query: {
            page,
            field: ['uuid', 'title', 'group'],
            page_size: MAX_PAGE_SIZE,
          },
        }),
      ),

    staleTime: UI_STALE_TIME,
  });
  const { values: formData } = useFormState<OfferingImportFormData>();

  return (
    <>
      <FieldArray name="categories_set" validate={requiredArray}>
        {(props) => (
          <FieldsListMapping
            {...props}
            offerings={formData.offerings}
            categories={categories}
          />
        )}
      </FieldArray>

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
