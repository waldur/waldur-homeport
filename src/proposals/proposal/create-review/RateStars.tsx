import { StarIcon, StarHalfIcon } from '@phosphor-icons/react';
import {
  FC,
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  RATING_STAR_ACTIVE_COLOR,
  RATING_STAR_INACTIVE_COLOR,
} from '@/core/constants';
import { translate } from '@/i18n';

interface RateStarsProps {
  value: string | number;
  size?: number;
  className?: string;
  count?: number;
  edit?: boolean;
  isHalf?: boolean;
  onChange?: (value: number) => void;
  /** Accessible name of the rating when it is editable. */
  label?: string;
}

const starLabel = (star: number) =>
  star === 1
    ? translate('1 star')
    : translate('{count} stars', { count: star });

export const RateStars: FC<RateStarsProps> = ({
  value,
  size = 20,
  className,
  count = 5,
  edit = false,
  isHalf = true,
  onChange,
  label,
}) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value || 0;
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const starRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const displayValue = hoverValue !== null ? hoverValue : numValue;
  // An editable rating is one radio group with a single tab stop: the chosen
  // star, or the first one while nothing is chosen.
  const focusableStar = numValue >= 1 ? Math.round(numValue) : 1;

  const handleClick = useCallback(
    (starIndex: number) => {
      if (edit && onChange) {
        onChange(starIndex);
      }
    },
    [edit, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, starIndex: number) => {
      const target = {
        ArrowRight: starIndex + 1,
        ArrowUp: starIndex + 1,
        ArrowLeft: starIndex - 1,
        ArrowDown: starIndex - 1,
        Home: 1,
        End: count,
        Enter: starIndex,
        ' ': starIndex,
      }[e.key];
      if (target === undefined) return;
      e.preventDefault();
      const star = Math.min(Math.max(target, 1), count);
      handleClick(star);
      starRefs.current[star]?.focus();
    },
    [count, handleClick],
  );

  const handleMouseEnter = useCallback(
    (starIndex: number) => {
      if (edit) {
        setHoverValue(starIndex);
      }
    },
    [edit],
  );

  const handleMouseLeave = useCallback(() => {
    if (edit) {
      setHoverValue(null);
    }
  }, [edit]);

  const stars = useMemo(() => {
    const result = [];
    for (let i = 1; i <= count; i++) {
      const isFilled = displayValue >= i;
      const isHalfFilled = isHalf && !isFilled && displayValue >= i - 0.5;

      const StarComponent = isHalfFilled ? StarHalfIcon : StarIcon;
      const color =
        isFilled || isHalfFilled
          ? RATING_STAR_ACTIVE_COLOR
          : RATING_STAR_INACTIVE_COLOR;

      result.push(
        <span
          key={i}
          ref={(el) => {
            starRefs.current[i] = el;
          }}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onKeyDown={edit ? (e) => handleKeyDown(e, i) : undefined}
          role={edit ? 'radio' : undefined}
          aria-checked={edit ? numValue === i : undefined}
          aria-label={edit ? starLabel(i) : undefined}
          tabIndex={edit ? (i === focusableStar ? 0 : -1) : undefined}
          style={{ cursor: edit ? 'pointer' : 'default' }}
        >
          {/* Through CSS `color`: the fill is currentColor, and a var()
              resolves there in every browser. */}
          <StarComponent weight="fill" size={size} style={{ color }} />
        </span>,
      );
    }
    return result;
  }, [
    displayValue,
    numValue,
    focusableStar,
    count,
    size,
    isHalf,
    edit,
    handleClick,
    handleKeyDown,
    handleMouseEnter,
  ]);

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', gap: 2 }}
      onMouseLeave={handleMouseLeave}
      role={edit ? 'radiogroup' : undefined}
      aria-label={edit ? label : undefined}
    >
      {stars}
    </span>
  );
};
