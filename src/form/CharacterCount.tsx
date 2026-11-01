import classNames from 'classnames';
import { FC } from 'react';

import { FormText } from 'waldur-ui';

import { countCharacters } from '@/core/validators';
import { translate } from '@/i18n';

interface CharacterCountProps {
  value?: string;
  /** The limit shown after the count; left out, only the count is shown. */
  max?: number;
  /** The value is as it was loaded. An overrun it arrived with (stored before
   * the limit existed) is not the user's doing and is shown in grey. */
  pristine?: boolean;
  className?: string;
}

/**
 * The length of a text under its control, as `n / max` when there is a
 * limit. Red only while the user's own editing has it over the limit, and
 * at once: the field's own error waits for the blur, and a long paste should
 * not look accepted until then.
 */
export const CharacterCount: FC<CharacterCountProps> = ({
  value,
  max,
  pristine,
  className,
}) => {
  const count = countCharacters(value);
  const over = max !== undefined && count > max && !pristine;
  return (
    <FormText
      variant={over ? 'danger' : 'muted'}
      className={classNames('text-end', className)}
      data-testid="character-count"
      data-state={over ? 'over' : undefined}
    >
      {max === undefined
        ? translate('{count} characters', { count })
        : `${count} / ${max}`}
    </FormText>
  );
};
