import { EyeIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { OfferingOptions } from 'waldur-js-client';

import { BaseButton } from '@/core/buttons/BaseButton';
import { CompactIconButton } from '@/core/buttons/IconButton';
import { FormGroup } from '@/form';
import { FieldError } from '@/form/FieldError';
import { Select } from '@/form/select';
import { translate } from '@/i18n';

import { getVisibleIfCandidates } from './validation';

interface VisibleIfConfigurationProps {
  options?: OfferingOptions;
  /** Key of the edited option; omitted when a new option is being added. */
  optionKey?: string;
}

// Shown straight away: the selects never blur, so `touched` stays false.
const RuleError: FC<{ name: string }> = ({ name }) => (
  <Field
    name={name}
    subscription={{ error: true }}
    render={({ meta }) =>
      meta.error ? <FieldError error={meta.error} /> : null
    }
  />
);

const getBooleanChoices = () => [
  { value: true, label: translate('Checked') },
  { value: false, label: translate('Unchecked') },
];

const ValuesField: FC<{ parent: any }> = ({ parent }) => {
  if (parent.type === 'boolean') {
    const choices = getBooleanChoices();
    return (
      <Field
        name="visible_if.values"
        render={({ input }) => (
          <Select
            value={choices.filter((choice) =>
              (input.value || []).includes(choice.value),
            )}
            onChange={(choice: any) =>
              input.onChange(choice ? [choice.value] : [])
            }
            options={choices}
            placeholder={translate('Select value...')}
            isClearable={false}
          />
        )}
      />
    );
  }
  const choices = (parent.choices || []).map((choice: string) => ({
    value: choice,
    label: choice,
  }));
  return (
    <Field
      name="visible_if.values"
      render={({ input }) => (
        <Select
          value={choices.filter((choice) =>
            (input.value || []).includes(choice.value),
          )}
          onChange={(selected: any) =>
            input.onChange((selected || []).map((choice) => choice.value))
          }
          options={choices}
          placeholder={translate('Select values...')}
          isMulti
        />
      )}
    />
  );
};

/**
 * "Show only when" rule of an offering option: the option is shown to the
 * customer only when an earlier boolean or select option has one of the
 * chosen values.
 */
export const VisibleIfConfiguration: FC<VisibleIfConfigurationProps> = ({
  options,
  optionKey,
}) => {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const rule = values.visible_if;

  const candidates = useMemo(
    () => getVisibleIfCandidates(options, optionKey),
    [options, optionKey],
  );
  const fieldChoices = useMemo(
    () =>
      candidates.map((key) => ({
        value: key,
        label: options.options[key]?.label || key,
      })),
    [candidates, options],
  );

  if (!rule && candidates.length === 0) {
    return null;
  }

  const parent = rule?.field ? options?.options?.[rule.field] : undefined;

  return (
    <FormGroup
      label={translate('Show only when')}
      description={translate(
        'Show this option only when an earlier option has one of the selected values. A hidden option is never required and its value is not stored.',
      )}
    >
      {rule ? (
        <div className="d-flex gap-2 align-items-start">
          <div className="flex-grow-1">
            <Field
              name="visible_if.field"
              render={({ input }) => (
                <Select
                  value={
                    fieldChoices.find(
                      (choice) => choice.value === input.value,
                    ) || null
                  }
                  onChange={(choice: any) => {
                    form.batch(() => {
                      input.onChange(choice?.value);
                      form.change('visible_if.values', []);
                    });
                  }}
                  options={fieldChoices}
                  placeholder={translate('Select option...')}
                  isClearable={false}
                />
              )}
            />
            <RuleError name="visible_if.field" />
          </div>
          <div className="flex-grow-1">
            {parent ? <ValuesField parent={parent} /> : null}
            {parent ? <RuleError name="visible_if.values" /> : null}
          </div>
          <CompactIconButton
            variant="outline-danger"
            onClick={() => form.change('visible_if', undefined)}
            iconNode={<TrashIcon weight="bold" />}
            tooltip={translate('Remove rule')}
          />
        </div>
      ) : (
        <BaseButton
          variant="outline-primary"
          size="sm"
          onClick={() =>
            form.change('visible_if', { field: undefined, values: [] })
          }
          iconNode={<EyeIcon className="me-1" weight="bold" />}
          label={translate('Add rule')}
        />
      )}
    </FormGroup>
  );
};
