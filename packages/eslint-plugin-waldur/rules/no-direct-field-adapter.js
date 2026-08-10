// Maps a field adapter to the autonomous `*Group` it should be replaced with.
// Only adapters that have a corresponding Group exported from `@/form` belong
// here — InputField, PhoneNumberField and FlatpickrField are intentionally
// omitted because they have no Group (they are used via the render-prop pattern
// or only as internal building blocks for Date/Time/DateTime groups).
const ADAPTER_TO_GROUP = {
  TextField: 'TextGroup',
  StringField: 'StringGroup',
  NumberField: 'NumberGroup',
  EmailField: 'EmailGroup',
  YearField: 'YearGroup',
  SliderNumberField: 'SliderNumberGroup',
  SecretField: 'SecretGroup',
  CommaSeparatedListField: 'CommaSeparatedListGroup',
  AwesomeCheckboxField: 'BooleanGroup',
  SelectField: 'SelectGroup',
  CreatableSelectField: 'CreatableSelectGroup',
  DateField: 'DateGroup',
  DateTimeField: 'DateTimeGroup',
  TimeField: 'TimeGroup',
  CountrySelectField: 'CountrySelectGroup',
  MonacoField: 'MonacoGroup',
  TimezoneField: 'TimezoneGroup',
  ImageField: 'ImageGroup',
  FileUploadField: 'FileUploadGroup',
  MarkdownEditor: 'MarkdownGroup',
  AsyncSelect: 'AsyncSelectGroup',
  AwesomeRadioButton: 'RadioGroup',
};

const DISALLOWED_ADAPTERS = new Set(Object.keys(ADAPTER_TO_GROUP));

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow passing custom form adapter components directly to Field component prop',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      noDirectAdapter:
        'Do not pass "{{adapterName}}" directly to component prop of Field. Use the corresponding Group component (e.g. {{groupName}}) or wrap it using the render-prop pattern.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'Field') {
          return;
        }

        const componentAttr = node.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'component',
        );

        if (
          componentAttr &&
          componentAttr.value &&
          componentAttr.value.type === 'JSXExpressionContainer'
        ) {
          const expression = componentAttr.value.expression;
          if (
            expression.type === 'Identifier' &&
            DISALLOWED_ADAPTERS.has(expression.name)
          ) {
            const adapterName = expression.name;
            const groupName = ADAPTER_TO_GROUP[adapterName];
            context.report({
              node: componentAttr,
              messageId: 'noDirectAdapter',
              data: {
                adapterName,
                groupName,
              },
            });
          }
        }
      },
    };
  },
};
