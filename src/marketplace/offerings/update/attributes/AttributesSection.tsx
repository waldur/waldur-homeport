import { FC } from 'react';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import {
  BooleanEditField,
  NumberEditField,
  SelectEditField,
  StringEditField,
  TextEditField,
  EditFieldProvider,
} from '@/form/editFields';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { AttributeCell } from '@/marketplace/common/AttributeCell';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { EditCategoryButton } from './EditCategoryButton';

function validateInt(value) {
  return value < 0 ? translate('Value should be positive integer') : undefined;
}

export const AttributesSection: FC<OfferingSectionProps & { category }> = (
  props,
) => {
  const updateMutation = useManagedMutation({
    mutationFn: (formData: any) =>
      marketplaceProviderOfferingsUpdateAttributes({
        path: { uuid: props.offering.uuid },
        body: {
          ...props.offering.attributes,
          ...formData.attributes,
        },
      }),
    successMessage: translate('Attribute has been updated.'),
    errorMessage: translate('Unable to update attribute'),
    refetch: props.refetch,
  });

  const callback = (formData) => updateMutation.mutateAsync(formData);

  return (
    <EditFieldProvider scope={props.offering} callback={callback}>
      <TabbedSection
        title={
          <>
            <span className="me-2">
              {translate('Category')}: {props.category.title}
            </span>
            <RefreshButton refetch={props.refetch} loading={props.loading} />
          </>
        }
        actions={<EditCategoryButton {...props} />}
        enableSearch
      >
        {props.category.sections.map((section, sectionIndex) => (
          <TabbedSection.Tab
            key={sectionIndex}
            id={section.title || `section-${sectionIndex}`}
            title={section.title}
          >
            {section.attributes.map((attribute, attributeIndex) => {
              const name = `attributes.${attribute.key}`;
              const label = attribute.title;
              const renderVal = (value) => (
                <AttributeCell attr={attribute} value={value} />
              );

              switch (attribute.type) {
                case 'boolean':
                  return (
                    <BooleanEditField
                      key={attributeIndex}
                      name={name}
                      label={label}
                      renderValue={renderVal}
                    />
                  );
                case 'integer':
                  return (
                    <NumberEditField
                      key={attributeIndex}
                      name={name}
                      label={label}
                      min={0}
                      parse={parseIntField}
                      format={formatIntField}
                      validate={validateInt}
                      renderValue={renderVal}
                    />
                  );
                case 'text':
                  return (
                    <TextEditField
                      key={attributeIndex}
                      name={name}
                      label={label}
                      solid
                      rows={7}
                      renderValue={renderVal}
                    />
                  );
                case 'list':
                  return (
                    <SelectEditField
                      key={attributeIndex}
                      name={name}
                      label={label}
                      options={attribute.options}
                      getOptionValue={(option) => option.key}
                      getOptionLabel={(option) => option.title}
                      isMulti={true}
                      isClearable={true}
                      simpleValue={true}
                      renderValue={renderVal}
                    />
                  );
                case 'choice':
                  return (
                    <SelectEditField
                      key={attributeIndex}
                      name={name}
                      label={label}
                      options={attribute.options}
                      getOptionValue={(option) => option.key}
                      getOptionLabel={(option) => option.title}
                      isClearable={true}
                      simpleValue={true}
                      renderValue={renderVal}
                    />
                  );
                default:
                  return (
                    <StringEditField
                      key={attributeIndex}
                      name={name}
                      label={label}
                      renderValue={renderVal}
                    />
                  );
              }
            })}
          </TabbedSection.Tab>
        ))}
      </TabbedSection>
    </EditFieldProvider>
  );
};
