import { useField } from 'react-final-form';

import { formatJsxTemplate, translate } from '@/i18n';

import { getOptionTransform, transformOptionValue } from './optionTransform';

/**
 * The value mastermind will store for what the user typed, shown under an
 * option with a transform. Nothing is shown before a value is typed, or
 * while the value is invalid: it would not be saved.
 */
export const OptionTransformPreview = ({
  option,
  name,
}: {
  option;
  name: string;
}) => {
  const transform = getOptionTransform(option);
  const {
    input: { value },
    meta: { invalid },
  } = useField(name, { subscription: { value: true, invalid: true } });
  if (!transform || invalid || typeof value !== 'string' || value === '') {
    return null;
  }
  return (
    <div
      className="form-text text-quaternary"
      data-testid="option-transform-preview"
    >
      {translate(
        'Will be saved as {value}',
        { value: <code>{transformOptionValue(transform, value)}</code> },
        formatJsxTemplate,
      )}
    </div>
  );
};
