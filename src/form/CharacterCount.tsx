import classNames from 'classnames';
import { FC, ReactNode, useId } from 'react';

import { FormText, FormTextVariant } from 'waldur-ui';

import { countCharacters } from '@/core/validators';
import { translate } from '@/i18n';

// From this share of the limit on, the counter is emphasised and the live
// region starts telling screen-reader users how much room is left.
const NEAR_LIMIT_RATIO = 0.9;

type CharacterCountState = 'normal' | 'near' | 'limit' | 'over';

const getCharacterCountState = (
  count: number,
  max: number | undefined,
  pristine: boolean | undefined,
): CharacterCountState => {
  if (max === undefined) return 'normal';
  if (count > max) {
    // An overrun the value arrived with (stored before the limit existed) is
    // not the user's doing: it stays grey until the value is edited.
    return pristine ? 'normal' : 'over';
  }
  if (count >= max) return 'limit';
  if (count >= max * NEAR_LIMIT_RATIO) return 'near';
  return 'normal';
};

const VARIANTS: Record<CharacterCountState, FormTextVariant> = {
  normal: 'default',
  near: 'warning',
  limit: 'danger',
  over: 'danger',
};

const toText = (value: unknown) =>
  value === null || value === undefined ? undefined : String(value);

interface CharacterCountProps {
  /** Lets the control point at the counter with `aria-describedby`. */
  id?: string;
  value?: unknown;
  /** The limit shown after the count; left out, only the count is shown. */
  max?: number;
  /** The value is as it was loaded. An overrun it arrived with (stored before
   * the limit existed) is not the user's doing and is shown in grey. */
  pristine?: boolean;
  className?: string;
}

/**
 * The length of a text under its control, as `n / max` when there is a
 * limit, counted in code points as the backend does. Emphasised from 90% of
 * the limit, red at it, and red at once when the user's own editing takes it
 * over: the field's own error waits for the blur, and a long paste should not
 * look accepted until then.
 */
export const CharacterCount: FC<CharacterCountProps> = ({
  id,
  value,
  max,
  pristine,
  className,
}) => {
  const count = countCharacters(toText(value));
  const state = getCharacterCountState(count, max, pristine);
  const variant =
    pristine && max !== undefined && count > max ? 'muted' : VARIANTS[state];
  return (
    <>
      <FormText
        id={id}
        data-testid="character-count"
        data-state={state}
        variant={variant}
        className={classNames(
          'text-end',
          {
            'font-semibold': state === 'near',
            'font-medium': state === 'limit' || state === 'over',
          },
          className,
        )}
      >
        {max === undefined ? (
          translate('{count} characters', { count })
        ) : (
          <>
            <span aria-hidden="true">
              {count} / {max}
            </span>
            <span className="sr-only">
              {translate('{count} of {max} characters used', {
                count,
                max,
              })}
            </span>
          </>
        )}
      </FormText>
      {max !== undefined ? (
        <span className="sr-only" role="status" aria-live="polite">
          {state === 'limit'
            ? translate('Character limit reached')
            : state === 'near'
              ? translate('{count} characters remaining', {
                  count: max - count,
                })
              : null}
        </span>
      ) : null}
    </>
  );
};

interface UseCharacterCountOptions {
  /** Show the counter: `n / maxLength` with a native `maxLength`, the length
   * alone without one. */
  showCharacterCount?: boolean;
  /** The control's native `maxLength`, which also stops input at the limit. */
  maxLength?: number;
  /** A limit shown as `n / max` that, unlike `maxLength`, does not cut the
   * text: pair it with a validator so an overlong value is refused in the
   * open rather than truncated. Shows the counter by itself. */
  maxCharacters?: number;
  /** The value is as it was loaded (see `CharacterCount`). */
  pristine?: boolean;
  value?: unknown;
  describedBy?: string;
}

/**
 * Wires an opt-in live character counter to a text control. Returns the
 * control's `aria-describedby` (the caller's own ids plus the counter's) and
 * the counter to render under the control, or `null` when it is off.
 */
export const useCharacterCount = ({
  showCharacterCount,
  maxLength,
  maxCharacters,
  pristine,
  value,
  describedBy,
}: UseCharacterCountOptions): {
  describedBy?: string;
  counter: ReactNode;
} => {
  const id = useId();
  if (maxCharacters === undefined && !showCharacterCount) {
    return { describedBy, counter: null };
  }
  const max =
    maxCharacters ?? (maxLength && maxLength > 0 ? maxLength : undefined);
  const counterId = `${id}-character-count`;
  return {
    describedBy: describedBy ? `${describedBy} ${counterId}` : counterId,
    counter: (
      <CharacterCount
        id={counterId}
        value={value}
        max={max}
        pristine={pristine}
      />
    ),
  };
};
