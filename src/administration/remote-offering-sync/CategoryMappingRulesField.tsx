import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { usePagination } from '@/core/usePagination';
import { required, requiredArray } from '@/core/validators';
import { SelectField } from '@/form';
import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { categoryAutocomplete } from '@/marketplace/common/autocompletes';
import { ActionButton } from '@/table/ActionButton';
import { TablePagination } from '@/table/TablePagination';

interface FieldValue {
  remote_category?;
  local_category?;
}

const FieldsListGroup = ({
  fields,
  remoteCategories,
}: FieldArrayRenderProps<FieldValue, HTMLElement> & { remoteCategories }) => {
  const {
    page,
    setPage,
    pageSize,
    changePageSize,
    visibleItems,
    refreshPageOnAdd,
    refreshPageOnRemove,
    hasPages,
  } = usePagination(fields);

  const addDisabled = fields.value?.some(
    (v) => !v.remote_category || !v.local_category,
  );

  const addRow = () => {
    if (!addDisabled) {
      fields.push({});
      refreshPageOnAdd();
    }
  };

  const removeRow = (index: number) => {
    if (fields.length > 1) {
      const currentPageItems = fields.value.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );
      fields.remove(index);

      const newLength = fields.length - 1;

      const lastPage = Math.ceil(newLength / pageSize);
      const isLastItemOnPage = currentPageItems.length === 1;

      if (isLastItemOnPage && page > 1 && page === lastPage) {
        setPage(page - 1);
      }

      const actualIndex = (page - 1) * pageSize + index;
      if (actualIndex < fields.value.length) {
        refreshPageOnRemove();
      }
    }
  };

  return (
    <div id="category-mapping-rules">
      <Form.Group>
        <table className="table table-row-bordered border-bottom mb-3">
          <thead>
            <tr>
              <td className="w-50">{translate('Remote category')}</td>
              <td className="w-50">{translate('Local category')}</td>
              <td className="w-70px">{translate('Actions')}</td>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((component, i) => {
              const actualIndex = (page - 1) * pageSize + i;
              return component ? (
                <Fragment key={`${page}-${i}-${fields.length}`}>
                  <tr>
                    <td>
                      <Field
                        component={SelectField}
                        name={`${fields.name}[${actualIndex}].remote_category`}
                        options={remoteCategories}
                        getOptionValue={(option) => option.uuid}
                        getOptionLabel={(option) => option.title}
                        validate={required}
                      />
                    </td>
                    <td>
                      <Field
                        name={`${fields.name}[${actualIndex}].local_category`}
                        validate={required}
                      >
                        {(fieldProps) => (
                          <AsyncPaginate
                            loadOptions={categoryAutocomplete}
                            defaultOptions
                            getOptionValue={(option) => option.url}
                            getOptionLabel={(option) => option.title}
                            value={fieldProps.input.value}
                            onChange={(value) =>
                              fieldProps.input.onChange(value)
                            }
                            noOptionsMessage={() => translate('No categories')}
                          />
                        )}
                      </Field>
                    </td>
                    <td>
                      <ActionButton
                        variant="text-danger"
                        action={() => removeRow(actualIndex)}
                        disabled={fields.length < 2}
                        disabledReason={translate(
                          'At least one mapping is required',
                        )}
                        iconNode={<TrashIcon weight="bold" />}
                      />
                    </td>
                  </tr>
                </Fragment>
              ) : null;
            })}
          </tbody>
        </table>
      </Form.Group>
      <div>
        <ActionButton
          variant="text-primary"
          action={addRow}
          disabled={addDisabled}
          disabledReason={translate('Complete existing mappings first')}
          iconNode={<PlusCircleIcon weight="bold" />}
          title={translate('Add new')}
        />
      </div>

      <TablePagination
        currentPage={page}
        pageSize={pageSize}
        resultCount={fields.length}
        hasRows={hasPages}
        showPageSizeSelector
        updatePageSize={changePageSize}
        gotoPage={setPage}
      />
    </div>
  );
};

export const CategoryMappingRulesField = ({ remoteCategories }) => (
  <FieldArray
    name="remotelocalcategory_set"
    component={FieldsListGroup}
    rerenderOnEveryChange
    validate={requiredArray}
    remoteCategories={remoteCategories}
  />
);
