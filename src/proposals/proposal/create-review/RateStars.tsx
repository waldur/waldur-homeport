import { StarIcon, StarHalfIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  RATING_STAR_ACTIVE_COLOR,
  RATING_STAR_INACTIVE_COLOR,
} from '@waldur/core/constants';

interface RateStarsProps {
  value: string | number;
  size?: number;
  className?: string;
  count?: number;
  edit?: boolean;
  isHalf?: boolean;
  onChange?: (value: number) => void;
}

export const RateStars: FC<RateStarsProps> = ({
  value,
  size = 20,
  className,
  count = 5,
  edit = false,
  isHalf = true,
  onChange,
}) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value || 0;
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : numValue;

  const handleClick = useCallback(
    (starIndex: number) => {
      if (edit && onChange) {
        onChange(starIndex);
      }
    },
    [edit, onChange],
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
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onKeyDown={
            edit
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick(i);
                  }
                }
              : undefined
          }
          role={edit ? 'button' : undefined}
          tabIndex={edit ? 0 : undefined}
          style={{ cursor: edit ? 'pointer' : 'default' }}
        >
          <StarComponent weight="fill" size={size} color={color} />
        </span>,
      );
    }
    return result;
  }, [displayValue, count, size, isHalf, edit, handleClick, handleMouseEnter]);

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', gap: 2 }}
      onMouseLeave={handleMouseLeave}
    >
      {stars}
    </span>
  );
};
