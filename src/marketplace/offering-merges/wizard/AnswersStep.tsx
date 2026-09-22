import { FC } from 'react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { Select } from 'waldur-ui';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { getUnknownAnswerKeys, MergeDraft } from '../utils';

interface KeyOption {
  value: string;
  label: string;
}

interface AnswersStepProps {
  sources: ProviderOfferingDetails[];
  target: ProviderOfferingDetails;
  draft: MergeDraft;
  onChange(draft: MergeDraft): void;
  disabled: boolean;
}

export const AnswersStep: FC<AnswersStepProps> = ({
  sources,
  target,
  draft,
  onChange,
  disabled,
}) => {
  const unknown = getUnknownAnswerKeys(sources, target);
  // Renames stored earlier stay visible even if the forms changed since.
  const keys = Array.from(
    new Set([...unknown, ...Object.keys(draft.attribute_key_mapping)]),
  ).sort();
  const targetOptions: KeyOption[] = Object.entries(
    target.options?.options ?? {},
  ).map(([key, field]) => ({
    value: key,
    label: field?.label ? `${field.label} (${key})` : key,
  }));

  const setKey = (oldKey: string, newKey?: string) => {
    const attribute_key_mapping = { ...draft.attribute_key_mapping };
    if (newKey) {
      attribute_key_mapping[oldKey] = newKey;
    } else {
      delete attribute_key_mapping[oldKey];
    }
    onChange({ ...draft, attribute_key_mapping });
  };

  if (keys.length === 0) {
    return (
      <NoResult
        title={translate('Nothing to rename')}
        message={translate(
          "The target's order form knows every answer key of the sources.",
        )}
        noAction
      />
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <p className="text-muted mb-0">
        {translate(
          "These answer keys are on the sources' order forms but not on the target's. Rename each to a target key, or leave it as is: the answers are kept, but the target's form does not show them.",
        )}
      </p>
      <FormTable.Card title={translate('Order answer keys')}>
        <FormTable>
          {keys.map((key) => (
            <FormTable.Item
              key={key}
              label={<code>{key}</code>}
              htmlFor={`answer-${key}`}
              value={
                <Select
                  inputId={`answer-${key}`}
                  options={targetOptions}
                  value={
                    targetOptions.find(
                      (option) =>
                        option.value === draft.attribute_key_mapping[key],
                    ) ?? null
                  }
                  onChange={(option: KeyOption | null) =>
                    setKey(key, option?.value)
                  }
                  isClearable
                  isDisabled={disabled}
                  placeholder={translate('Keep as is')}
                />
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>
    </div>
  );
};
