import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { BaseButton } from 'waldur-ui';

import { usePagination } from '@/core/usePagination';
import { required, requiredArray } from '@/core/validators';
import { SelectField } from '@/form';
import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { categoryAutocomplete } from '@/marketplace/common/autocompletes';
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
      fields.remove(index);
      const lastPage = Math.ceil((fields.length - 1) / pageSize);
      if (page > lastPage) {
        setPage(lastPage);
      }
    }
  };

  const loadCategories = useMemo(() => categoryAutocomplete(), []);

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
            {visibleItems.map((name, i) =>
              name ? (
                <Fragment key={`${page}-${i}-${fields.length}`}>
                  <tr>
                    <td data-testid="remote-category-col">
                      <Field
                        name={`${name}.remote_category`}
                        validate={required}
                      >
                        {({ input, meta }) => (
                          <SelectField
                            input={input}
                            meta={meta}
                            options={remoteCategories}
                            getOptionValue={(option) => option.uuid}
                            getOptionLabel={(option) => option.title}
                          />
                        )}
                      </Field>
                    </td>
                    <td data-testid="local-category-col">
                      <Field
                        name={`${name}.local_category`}
                        validate={required}
                      >
                        {(fieldProps) => (
                          <AsyncSelect
                            inputId={fieldProps.input.name}
                            loadOptions={loadCategories}
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
                      <BaseButton
                        variant="text-danger"
                        onClick={() => removeRow(i)}
                        disabled={fields.length < 2}
                        disabledReason={translate(
                          'At least one mapping is required',
                        )}
                        iconNode={<TrashIcon weight="bold" />}
                        size="lg"
                      />
                    </td>
                  </tr>
                </Fragment>
              ) : null,
            )}
          </tbody>
        </table>
      </Form.Group>
      <div>
        <BaseButton
          variant="text-primary"
          onClick={addRow}
          disabled={addDisabled}
          disabledReason={translate('Complete existing mappings first')}
          iconNode={<PlusCircleIcon weight="bold" />}
          label={translate('Add new')}
          size="lg"
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
