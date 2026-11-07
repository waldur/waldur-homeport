import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useMemo } from 'react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import {
  BaseButton,
  FormField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from 'waldur-ui';

import { usePagination } from '@/core/usePagination';
import { required, requiredArray } from '@/core/validators';
import { SelectField } from '@/form';
import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { categoryAutocomplete } from '@/marketplace/common/autocompletes';

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
      <FormField>
        <Table
          scrollable={false}
          className="border-b border-b-secondary mb-2.5"
        >
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">
                {translate('Remote category')}
              </TableHead>
              <TableHead className="w-1/2">
                {translate('Local category')}
              </TableHead>
              <TableHead className="w-[70px]">{translate('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleItems.map((name, i) =>
              name ? (
                <Fragment key={`${page}-${i}-${fields.length}`}>
                  <TableRow>
                    <TableCell data-testid="remote-category-col">
                      <Field
                        name={`${name}.remote_category`}
                        validate={required}
                      >
                        {({ input, meta }) => (
                          <SelectField
                            input={input}
                            meta={meta}
                            aria-label={`${translate('Remote category')} ${i + 1}`}
                            options={remoteCategories}
                            getOptionValue={(option) => option.uuid}
                            getOptionLabel={(option) => option.title}
                          />
                        )}
                      </Field>
                    </TableCell>
                    <TableCell data-testid="local-category-col">
                      <Field
                        name={`${name}.local_category`}
                        validate={required}
                      >
                        {(fieldProps) => (
                          <AsyncSelect
                            aria-label={`${translate('Local category')} ${i + 1}`}
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
                    </TableCell>
                    <TableCell>
                      <BaseButton
                        tooltip={translate('Remove')}
                        variant="text-danger"
                        onClick={() => removeRow(i)}
                        disabled={fields.length < 2}
                        disabledReason={translate(
                          'At least one mapping is required',
                        )}
                        iconNode={<TrashIcon weight="bold" />}
                        size="lg"
                      />
                    </TableCell>
                  </TableRow>
                </Fragment>
              ) : null,
            )}
          </TableBody>
        </Table>
      </FormField>
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
        bordered={false}
      />
    </div>
  );
};

export const CategoryMappingRulesField = ({ remoteCategories }) => (
  <FieldArray
    name="remotelocalcategory_set"
    component={FieldsListGroup}
    validate={requiredArray}
    remoteCategories={remoteCategories}
  />
);
