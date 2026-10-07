import { SVGProps } from 'react';

/**
 * The check: the path the legacy Bootstrap checkbox drew, as an element in
 * `currentColor`. Checkbox draws it inside its box; a single-select draws
 * it at the end of the selected option.
 */
export const CheckMark = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" viewBox="0 0 12 9" fill="none" {...props}>
    <path
      d="M11 1.25L4.125 8.125L1 5"
      stroke="currentColor"
      strokeWidth="1.6666"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
