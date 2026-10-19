import { useId } from 'react';

import { cn } from '../cn';

/**
 * The concentric rings behind a featured icon (a dialog header's icon, an
 * empty state's), fading out towards the bottom. The rings take
 * `currentColor`: gray-200 in light mode and gray-700 in dark, the two
 * strokes of the app's former Background.svg/BackgroundDark.svg pair, so
 * the theme comes from CSS (`data-theme`) rather than a React theme hook.
 *
 * The mask and gradient ids come from useId: two of these on one page (a
 * dialog over an empty state) would otherwise share one id, and the second
 * would mask with the first one's gradient.
 */
export const RadialBackground = ({ className }: { className?: string }) => {
  const id = useId();
  const maskId = `${id}-mask`;
  const gradientId = `${id}-gradient`;
  return (
    <svg
      width="524"
      height="280"
      viewBox="0 0 524 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn(
        'pointer-events-none text-[var(--color-gray-200)] dark:text-[var(--color-gray-700)]',
        className,
      )}
    >
      <mask
        id={maskId}
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="-194"
        width="524"
        height="525"
      >
        <rect
          y="-193.5"
          width="524"
          height="524"
          fill={`url(#${gradientId})`}
        />
      </mask>
      <g mask={`url(#${maskId})`} stroke="currentColor" strokeWidth="0.750851">
        <circle cx="260.953" cy="67.4529" r="47.679" />
        <circle opacity="0.9" cx="260.954" cy="67.4537" r="83.7198" />
        <circle opacity="0.8" cx="260.953" cy="67.4535" r="119.761" />
        <circle opacity="0.7" cx="260.953" cy="67.4533" r="155.801" />
        <circle opacity="0.6" cx="260.953" cy="67.4531" r="191.842" />
        <circle opacity="0.5" cx="260.953" cy="67.4529" r="227.883" />
        <circle opacity="0.4" cx="260.953" cy="67.4527" r="263.924" />
      </g>
      <defs>
        <linearGradient
          id={gradientId}
          x1="262"
          y1="-193.5"
          x2="262"
          y2="330.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.437233" stopColor="white" />
          <stop offset="0.662338" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
