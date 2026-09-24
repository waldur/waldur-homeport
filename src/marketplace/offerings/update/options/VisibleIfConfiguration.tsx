import { PlusIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { OfferingOptions } from 'waldur-js-client';

import { FormGroup } from '@/form';
import { FieldError } from '@/form/FieldError';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';
import { RemovalActionButton } from '@/table/RemovalActionButton';

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
      description={
        rule ? (
          <>
            {translate("Hidden answers aren't saved.")}
            {values.required ? (
              <> {translate('Required only while visible.')}</>
            ) : null}
          </>
        ) : (
          translate(
            'Show this option only for certain answers to an earlier option.',
          )
        )
      }
    >
      {rule ? (
        // Grid, not flex-grow: the value picker only renders once an option is
        // chosen, and free-space distribution made the first select resize
        // when it appeared.
        <div className="row g-2 align-items-start">
          <div className="col">
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
          <div className="col">
            {parent ? <ValuesField parent={parent} /> : null}
            {parent ? <RuleError name="visible_if.values" /> : null}
          </div>
          <div className="col-auto">
            <RemovalActionButton
              action={() => form.change('visible_if', undefined)}
              tooltip={translate('Remove rule')}
              // Square at the selects' own height, so the rule stays one row.
              className="h-40px w-40px"
            />
          </div>
        </div>
      ) : (
        // Same control the other in-dialog row adders use (checklist answer
        // options, cascade steps): compact, text-primary, plus icon.
        <CompactActionButton
          action={() =>
            form.change('visible_if', { field: undefined, values: [] })
          }
          title={translate('Add rule')}
          iconNode={<PlusIcon weight="bold" />}
          variant="text-primary"
        />
      )}
    </FormGroup>
  );
};
