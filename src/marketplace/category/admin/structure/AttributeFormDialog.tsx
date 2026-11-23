import { PlusIcon } from '@phosphor-icons/react';
import { ARRAY_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  Attribute,
  AttributeCreateRequest,
  AttributeTypeEnum,
  marketplaceAttributesCreate,
  marketplaceAttributesPartialUpdate,
  Section,
} from 'waldur-js-client';

import {
  BaseButton,
  FormText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  nextId,
} from 'waldur-ui';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import { getAttributeTypeOptions, hasOptions, makeOptionKey } from './utils';

/**
 * `ref` names an option inside the form, so the default can point at an
 * option before it has a key: a saved option's ref is its key, a new one's a
 * placeholder swapped for the generated key on submit.
 */
interface OptionFormValue {
  ref: string;
  key?: string;
  title: string;
}

interface AttributeFormValues {
  title: string;
  type: AttributeTypeEnum;
  required: boolean;
  options: OptionFormValue[];
  default: unknown;
}

const NEW_OPTION_PREFIX = '__new_';

// A title of only spaces would be sent empty and refused by the server.
const requiredText = (value: unknown) =>
  required(typeof value === 'string' ? value.trim() : value);

// Offerings validate integer attributes as non-negative, so a default below
// zero would be refused for every offering that relies on it.
const validateNonNegativeInteger = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  value !== '' &&
  (!Number.isInteger(Number(value)) || Number(value) < 0)
    ? translate('Value should be positive integer')
    : undefined;

const validateAttribute = (values: AttributeFormValues) => {
  if (
    !hasOptions(values.type) ||
    (values.options ?? []).some((option) => option.title?.trim())
  ) {
    return undefined;
  }
  // final-form keeps an array's own error on the array: it writes the rows'
  // field errors into it by index, so a plain object here crashes the form
  // as soon as a row is added.
  const optionsError: unknown[] & { [ARRAY_ERROR]?: string } = [];
  optionsError[ARRAY_ERROR] = translate('Add at least one option.');
  return { options: optionsError };
};

const newOption = (): OptionFormValue => ({
  ref: `${NEW_OPTION_PREFIX}${nextId()}`,
  title: '',
});

const getInitialValues = (attribute?: Attribute): AttributeFormValues => {
  if (!attribute) {
    return {
      title: '',
      type: 'string',
      required: false,
      options: [],
      default: null,
    };
  }
  return {
    title: attribute.title,
    type: attribute.type,
    required: Boolean(attribute.required),
    options: (attribute.options ?? []).map((option) => ({
      ref: option.key,
      key: option.key,
      title: option.title,
    })),
    default: attribute.default ?? null,
  };
};

/** Turns form values into the request, resolving new options' keys. */
export const buildAttributeRequest = (
  values: AttributeFormValues,
  section: Section,
  savedOptionKeys: string[] = [],
): AttributeCreateRequest => {
  const withOptions = hasOptions(values.type);
  const options = withOptions
    ? values.options.filter((option) => option.title?.trim())
    : [];
  // Keys of options removed in this edit stay reserved: a new option taking
  // one would be matched to the old option and inherit offerings' values.
  const taken = new Set([
    ...savedOptionKeys,
    ...options.map((option) => option.key).filter(Boolean),
  ]);
  const keyByRef: Record<string, string> = {};
  const requestOptions = options.map((option) => {
    const key = option.key ?? makeOptionKey(option.title, taken);
    taken.add(key);
    keyByRef[option.ref] = key;
    return { key, title: option.title.trim() };
  });

  let defaultValue: unknown = values.default;
  if (values.type === 'choice') {
    defaultValue = keyByRef[defaultValue as string] ?? null;
  } else if (values.type === 'list') {
    defaultValue = Array.isArray(defaultValue)
      ? defaultValue.map((ref) => keyByRef[ref]).filter(Boolean)
      : [];
    if (!(defaultValue as string[]).length) {
      defaultValue = null;
    }
  } else if (values.type === 'integer') {
    defaultValue =
      defaultValue === '' || defaultValue === null || defaultValue === undefined
        ? null
        : Number(defaultValue);
  } else if (values.type === 'boolean') {
    defaultValue = typeof defaultValue === 'boolean' ? defaultValue : null;
  } else if (defaultValue === '' || typeof defaultValue !== 'string') {
    defaultValue = null;
  }

  return {
    title: values.title.trim(),
    section: section.url,
    type: values.type,
    required: values.required,
    default: defaultValue as AttributeCreateRequest['default'],
    ...(withOptions ? { options: requestOptions } : {}),
  };
};

const OptionsEditor: FC = () => (
  <FieldArray<OptionFormValue> name="options">
    {({ fields, meta }) => (
      <div className="mb-5">
        <div className="mb-2 font-medium">{translate('Options')}</div>
        {fields.length > 0 && (
          <Table scrollable={false} density="compact">
            <TableHeader>
              <TableRow divided={false}>
                <TableHead>{translate('Title')}</TableHead>
                <TableHead className="w-1/3">{translate('Key')}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((name, index) => (
                <TableRow key={fields.value[index].ref} divided={false}>
                  <TableCell>
                    <StringGroup
                      name={`${name}.title`}
                      validate={requiredText}
                      spaceless
                      aria-label={translate('Option title')}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-tertiary">
                    {fields.value[index].key ?? translate('Set on save')}
                  </TableCell>
                  <TableCell>
                    <RemovalActionButton
                      action={() => fields.remove(index)}
                      tooltip={translate('Remove option')}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <BaseButton
          variant="tertiary"
          size="sm"
          iconNode={<PlusIcon weight="bold" />}
          label={translate('Add option')}
          onClick={() => fields.push(newOption())}
          className="mt-2"
        />
        {typeof meta.error === 'string' && (
          <FormText className="mt-2 text-danger" role="alert">
            {meta.error}
          </FormText>
        )}
        <FormText className="mt-2 leading-5">
          {translate(
            'Offerings store the key of the option they select, so a saved option keeps its key when renamed. An offering that uses a removed option must choose another value before its attributes can be saved again.',
          )}
        </FormText>
      </div>
    )}
  </FieldArray>
);

const DefaultValueField: FC = () => {
  const { values } = useFormState<AttributeFormValues>({
    subscription: { values: true },
  });
  const optionChoices = useMemo(
    () =>
      (values.options ?? [])
        .filter((option) => option.title?.trim())
        .map((option) => ({ value: option.ref, label: option.title })),
    [values.options],
  );
  const label = translate('Default value');
  const description = translate(
    'Used for offerings that do not set a value of their own.',
  );

  switch (values.type) {
    case 'string':
      return (
        <StringGroup name="default" label={label} description={description} />
      );
    case 'text':
      return (
        <TextGroup name="default" label={label} description={description} />
      );
    case 'integer':
      return (
        <NumberGroup
          name="default"
          label={label}
          description={description}
          validate={validateNonNegativeInteger}
        />
      );
    case 'boolean':
      return (
        <SelectGroup
          name="default"
          label={label}
          description={description}
          options={[
            { value: true, label: translate('Yes') },
            { value: false, label: translate('No') },
          ]}
          simpleValue
          isClearable
          placeholder={translate('No default')}
        />
      );
    case 'choice':
    case 'list':
      return (
        <SelectGroup
          // Remount on type switch: one holds a key, the other a list.
          key={values.type}
          name="default"
          label={label}
          description={description}
          options={optionChoices}
          isMulti={values.type === 'list'}
          simpleValue
          isClearable
          placeholder={translate('No default')}
          noOptionsMessage={() => translate('Add options first')}
        />
      );
    default:
      return null;
  }
};

interface AttributeFormDialogProps {
  resolve: {
    section: Section;
    attribute?: Attribute;
    refetch: () => void;
  };
}

export const AttributeFormDialog: FC<AttributeFormDialogProps> = ({
  resolve: { section, attribute, refetch },
}) => {
  const isEdit = Boolean(attribute);
  const initialValues = useMemo(() => getInitialValues(attribute), [attribute]);

  const mutation = useManagedMutation<unknown, unknown, AttributeFormValues>({
    mutationFn: (values) => {
      const body = buildAttributeRequest(
        values,
        section,
        initialValues.options.map((option) => option.key),
      );
      return isEdit
        ? marketplaceAttributesPartialUpdate({
            path: { uuid: attribute.uuid },
            body,
          })
        : marketplaceAttributesCreate({ body });
    },
    successMessage: isEdit
      ? translate('The attribute has been updated.')
      : translate('The attribute has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update the attribute.')
      : translate('Unable to add the attribute.'),
    refetch,
  });

  return (
    <Form<AttributeFormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => {})}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      validate={validateAttribute}
      render={({
        handleSubmit,
        submitting,
        pristine,
        invalid,
        form,
        values,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit attribute')
                : translate('Add attribute to {section}', {
                    section: section.title,
                  })
            }
            footer={
              <SubmitButton
                disabled={invalid || pristine}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Add')}
              />
            }
          >
            <StringGroup
              name="title"
              label={translate('Title')}
              validate={requiredText}
              required
            />
            <SelectGroup
              name="type"
              label={translate('Type')}
              options={getAttributeTypeOptions()}
              simpleValue
              required
              validate={requiredText}
              description={
                isEdit
                  ? translate(
                      'Values that offerings already hold are not converted when the type changes.',
                    )
                  : undefined
              }
              onChange={(option) => {
                // The previous type's default no longer fits a new type.
                if (option?.value !== values.type) {
                  form.change('default', null);
                }
              }}
            />
            <BooleanGroup
              name="required"
              label={translate('Required')}
              description={translate(
                'Offerings in this category must set a value whenever their attributes are saved.',
              )}
              className="mb-4"
            />
            <OptionsSlot />
            <DefaultValueField />
          </ModalDialog>
        </form>
      )}
    />
  );
};

const OptionsSlot: FC = () => {
  const { values } = useFormState<AttributeFormValues>({
    subscription: { values: true },
  });
  return hasOptions(values.type) ? <OptionsEditor /> : null;
};
