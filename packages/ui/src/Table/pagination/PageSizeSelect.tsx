import { CaretDownIcon } from '@phosphor-icons/react';
import { useId } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { PAGE_SIZES } from './constants';

export interface PageSizeSelectProps {
  pageSize: number;
  onChange: (pageSize: number) => void;
}

/**
 * "Rows per page: [10 ⌄]". A native <select>, borderless and transparent so
 * it reads as part of the footer text; the caret is an icon rather than a
 * background image so it can follow the theme's tokens.
 */
export const PageSizeSelect = ({ pageSize, onChange }: PageSizeSelectProps) => {
  const id = useId();
  return (
    <div className="flex items-center">
      <label
        htmlFor={id}
        className="m-0 whitespace-nowrap text-[12px] text-[var(--pagination-text)]"
      >
        {translate('Rows per page')}:
      </label>
      <span className="relative inline-flex items-center">
        <select
          id={id}
          value={pageSize}
          onChange={(event) => onChange(parseInt(event.target.value, 10))}
          className="cursor-pointer appearance-none rounded-[6px] border-[1px] border-solid border-[color:transparent] bg-[transparent] py-[5px] pl-[6.5px] pr-[16px] text-[12px] leading-[1.43] text-[var(--pagination-select-text)] [&>option]:bg-[var(--surface-card-bg)]"
        >
          {PAGE_SIZES.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <CaretDownIcon
          aria-hidden="true"
          size={12}
          weight="bold"
          className="pointer-events-none absolute right-0 text-[var(--pagination-icon)]"
        />
      </span>
    </div>
  );
};
