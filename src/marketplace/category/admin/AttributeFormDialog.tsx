import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import arrayMutators from 'final-form-arrays';
import { FC, useEffect, useRef } from 'react';
import { Field, Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useDispatch } from 'react-redux';
import {
  type AttributeRequest,
  type PatchedAttributeRequest,
  marketplaceAttributeOptionsCreate,
  marketplaceAttributeOptionsDestroy,
  marketplaceAttributeOptionsPartialUpdate,
  marketplaceAttributesCreate,
  marketplaceAttributesPartialUpdate,
} from 'waldur-js-client';
import { NestedAttribute, NestedSection } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { SubmitButton } from '@waldur/form';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Category } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

const ATTRIBUTE_TYPE_OPTIONS = [
  { value: 'string', label: translate('String') },
  { value: 'integer', label: translate('Integer') },
  { value: 'text', label: translate('Text') },
  { value: 'boolean', label: translate('Boolean') },
  { value: 'list', label: translate('Dropdown') },
  { value: 'choice', label: translate('Choice') },
];

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '_');

const getSectionUrl = (sectionKey: string) =>
  `/api/marketplace-sections/${sectionKey}/`;

interface AttributeFormDialogProps {
  resolve: {
    section: NestedSection;
    category: Category;
    attribute?: NestedAttribute;
    refetch: () => void;
  };
}

const PossibleValuesFieldArray: FC<{
  fields: {
    map: (
      fn: (name: string, i: number) => React.ReactNode,
    ) => React.ReactNode[];
    push: (v: { title: string }) => void;
    remove: (i: number) => void;
    length?: number;
  };
}> = ({ fields }) => (
  <div className="mb-3">
    <label className="form-label">{translate('Possible values')}</label>
    {fields.map((name, index) => (
      <div key={name} className="d-flex align-items-center gap-2 mb-2">
        <div className="flex-grow-1">
          <Field
            name={`${name}.title`}
            component={StringField as any}
            placeholder={translate('Value')}
          />
        </div>
        <ActionButton
          action={() => fields.remove(index)}
          iconNode={<TrashIcon weight="bold" />}
          variant="text-danger"
          disabled={(fields.length ?? 0) <= 1}
          tooltip={
            (fields.length ?? 0) <= 1
              ? translate('At least one possible value is required')
              : undefined
          }
        />
      </div>
    ))}
    <CompactActionButton
      action={() => fields.push({ title: '' })}
      title={translate('Add new')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="text-success"
    />
  </div>
);

export const AttributeFormDialog: FC<AttributeFormDialogProps> = ({
  resolve: { section, attribute, refetch },
}) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(attribute?.key);

  const getAttributeUuid = () => {
    const attr = attribute as { uuid?: string };
    return attr?.uuid;
  };

  const onSubmit = async (formData: {
    title: string;
    type: string;
    required: boolean;
    default?: string;
    possibleValues?: { title: string }[];
    defaultChoiceValue?: string;
  }) => {
    try {
      const attributeKey = isEdit
        ? attribute!.key
        : `${section.key}_${slugify(formData.title)}`;
      const validOptions =
        formData.possibleValues
          ?.filter((opt) => opt?.title?.trim())
          .map((opt) => opt!.title!.trim()) ?? [];
      const formOptionKeys = new Set(
        validOptions.map((t) => `${attributeKey}_${slugify(t)}`),
      );
      const defaultTitle = formData.defaultChoiceValue?.trim();
      const defaultOptionKey = defaultTitle
        ? `${attributeKey}_${slugify(defaultTitle)}`
        : null;
      const validDefaultOptionKey =
        defaultOptionKey && formOptionKeys.has(defaultOptionKey)
          ? defaultOptionKey
          : null;

      let attributeUrl: string;
      let attributeUuid: string;

      if (isEdit) {
        attributeUuid = getAttributeUuid()!;
        if (!attributeUuid) {
          throw new Error('Attribute uuid is required for update');
        }
        const updateBody: PatchedAttributeRequest = {
          title: formData.title,
          type: (formData.type || 'string') as PatchedAttributeRequest['type'],
          required: formData.required,
        };
        if (formData.type !== 'choice') {
          updateBody.default = formData.default ?? null;
        } else {
          updateBody.default = validDefaultOptionKey ?? null;
        }
        await marketplaceAttributesPartialUpdate({
          path: { uuid: attributeUuid },
          body: updateBody,
        });
        attributeUrl =
          (attribute as { url?: string })?.url ||
          `/api/marketplace-attributes/${attributeUuid}/`;
      } else {
        const createBody: AttributeRequest = {
          key: attributeKey,
          title: formData.title,
          section: getSectionUrl(section.key),
          type: (formData.type || 'string') as AttributeRequest['type'],
          required: formData.required,
        };
        if (formData.type !== 'choice') {
          createBody.default = formData.default ?? undefined;
        }
        const created = await marketplaceAttributesCreate({
          body: createBody,
        }).then((r) => r.data);
        attributeUrl = created.url;
        attributeUuid = created.uuid;
      }

      if (formData.type === 'choice' && formData.possibleValues?.length) {
        const validOptions = formData.possibleValues
          .filter((opt) => opt?.title?.trim())
          .map((opt) => opt!.title!.trim());

        const existingOptions = attribute?.options ?? [];
        const formOptionKeys = new Set(
          validOptions.map((t) => `${attributeKey}_${slugify(t)}`),
        );

        for (const opt of existingOptions) {
          const optUuid = (opt as { uuid?: string }).uuid;
          if (optUuid && !formOptionKeys.has(opt.key!)) {
            await marketplaceAttributeOptionsDestroy({
              path: { uuid: optUuid },
            });
          }
        }

        for (const title of validOptions) {
          const optionKey = `${attributeKey}_${slugify(title)}`;
          const existingOpt = existingOptions.find((o) => o.key === optionKey);
          if (existingOpt) {
            const optUuid = (existingOpt as { uuid?: string }).uuid;
            if (optUuid) {
              await marketplaceAttributeOptionsPartialUpdate({
                path: { uuid: optUuid },
                body: { title },
              });
            }
          } else {
            await marketplaceAttributeOptionsCreate({
              body: {
                key: optionKey,
                title,
                attribute: attributeUrl,
              },
            });
          }
        }

        if (validDefaultOptionKey && !isEdit) {
          await marketplaceAttributesPartialUpdate({
            path: { uuid: attributeUuid },
            body: { default: validDefaultOptionKey },
          });
        }
      }

      refetch();
      dispatch(
        showSuccess(
          isEdit
            ? translate('The attribute has been updated.')
            : translate('The attribute has been added.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update attribute.')
            : translate('Unable to add attribute.'),
        ),
      );
    }
  };

  const dialogTitle = isEdit
    ? translate('Edit attribute')
    : translate('Add attribute to section {name}', {
        name: section.title || section.key,
      });

  const validate = (values: {
    type?: string;
    possibleValues?: { title: string }[];
  }) => {
    const errors: { _possibleValues?: string } = {};
    if (values.type === 'choice' && values.possibleValues) {
      const hasValue = values.possibleValues.some((v) => v?.title?.trim());
      if (!hasValue) {
        errors._possibleValues = translate(
          'At least one possible value is required.',
        );
      }
    }
    return errors;
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      mutators={{ ...arrayMutators }}
      subscription={{
        values: true,
        errors: true,
        invalid: true,
        submitting: true,
      }}
      initialValues={{
        title: attribute?.title ?? '',
        type: attribute?.type ?? 'string',
        required: attribute?.required ?? false,
        default: attribute?.type !== 'choice' ? (attribute?.default ?? '') : '',
        possibleValues:
          attribute?.type === 'choice' && attribute?.options?.length
            ? attribute.options.map((o) => ({ title: o.title }))
            : [{ title: '' }],
        defaultChoiceValue:
          attribute?.type === 'choice' &&
          attribute?.default &&
          attribute?.options
            ? (attribute.options.find((o) => o.key === attribute.default)
                ?.title ?? '')
            : '',
      }}
      render={({ handleSubmit, form, submitting, invalid, values, errors }) => {
        const isChoice = values.type === 'choice';
        const possibleValuesError = errors?._possibleValues;

        const prevTypeRef = useRef(values.type);
        useEffect(() => {
          if (prevTypeRef.current !== values.type) {
            prevTypeRef.current = values.type;
            form.change('default', '');
            form.change('defaultChoiceValue', '');
          }
        }, [values.type, form]);

        useEffect(() => {
          if (
            isChoice &&
            values.defaultChoiceValue?.trim() &&
            values.possibleValues?.length
          ) {
            const validTitles = new Set(
              values.possibleValues
                .filter((v) => v?.title?.trim())
                .map((v) => v!.title!.trim()),
            );
            if (!validTitles.has(values.defaultChoiceValue.trim())) {
              form.change('defaultChoiceValue', '');
            }
          }
        }, [isChoice, values.defaultChoiceValue, values.possibleValues, form]);
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={dialogTitle}
              iconNode={<PlusCircleIcon weight="bold" />}
              iconColor="success"
              closeButton
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid || !!possibleValuesError}
                    label={translate('Confirm')}
                  />
                </>
              }
            >
              <FormGroup label={translate('Name')} required>
                <Field
                  name="title"
                  validate={required}
                  component={StringField as any}
                  placeholder={translate('Type a name')}
                />
              </FormGroup>
              <FormGroup label={translate('Data type')} required>
                <Field
                  name="type"
                  component={SelectField as any}
                  options={ATTRIBUTE_TYPE_OPTIONS}
                  getOptionValue={(option) => option.value}
                  getOptionLabel={(option) => option.label}
                  isClearable={false}
                  simpleValue
                />
              </FormGroup>
              <FormGroup label={translate('Required')}>
                <Field name="required" component="input" type="checkbox" />
              </FormGroup>
              {isChoice && (
                <>
                  {possibleValuesError && (
                    <div className="text-danger small mb-2">
                      {possibleValuesError}
                    </div>
                  )}
                  <FormGroup label={translate('Default value')}>
                    <Field
                      name="defaultChoiceValue"
                      component={SelectField as any}
                      options={
                        values.possibleValues
                          ?.filter((v) => v?.title?.trim())
                          .map((v) => ({
                            value: v!.title!.trim(),
                            label: v!.title!.trim(),
                          })) ?? []
                      }
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.label}
                      isClearable
                      simpleValue
                      placeholder={translate('Select...')}
                    />
                  </FormGroup>
                  <FieldArray name="possibleValues">
                    {({ fields }) => (
                      <PossibleValuesFieldArray fields={fields} />
                    )}
                  </FieldArray>
                </>
              )}
              {!isChoice && (
                <FormGroup label={translate('Default value')}>
                  <Field
                    name="default"
                    component={StringField as any}
                    placeholder={translate('Optional')}
                  />
                </FormGroup>
              )}
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
