import { FC, useRef } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { Checkbox } from 'waldur-ui';

import { FieldWarning } from '@/form/FieldWarning';
import { SelectMultiBooleanGroup } from '@/form/SelectMultiBooleanGroup';
import { translate } from '@/i18n';

import { ALL_MODELS, isAllModels } from './modelSelection';

interface ModelSelectionFieldProps extends FieldRenderProps<string[]> {
  options: string[];
  disabled?: boolean;
}

// A resource's model selection: an All models tick above the per-model ones.
// Ticked, the value is ["*"], which also takes in models the offering adds
// later; otherwise the individual ticks decide, and none is no model.
export const ModelSelectionField: FC<ModelSelectionFieldProps> = ({
  input,
  options,
  disabled,
}) => {
  const value = Array.isArray(input.value) ? input.value : [];
  const everyModel = isAllModels(value);
  // The individual ticks stay as they were while All models locks them, and
  // decide again once it is cleared.
  const ticks = useRef<string[]>(everyModel ? [] : value);
  return (
    <div className="flex flex-col gap-2">
      <Checkbox
        label={translate('All models')}
        checked={everyModel}
        disabled={disabled}
        onCheckedChange={(checked: boolean) => {
          if (checked) {
            ticks.current = value;
            input.onChange([ALL_MODELS]);
          } else {
            input.onChange(ticks.current);
          }
        }}
      />
      <SelectMultiBooleanGroup
        input={{ ...input, value: everyModel ? ticks.current : value }}
        options={options}
        checkboxes
        disabled={disabled || everyModel}
      />
      {/* Not an error: a resource without models is a valid thing to ask
          for. Left alone (several resources edited at once) it is not sent. */}
      {Array.isArray(input.value) && !input.value.length && (
        <FieldWarning
          error={translate(
            "The resource's API keys will not be able to call any model.",
          )}
        />
      )}
    </div>
  );
};
