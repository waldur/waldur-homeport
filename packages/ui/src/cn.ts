import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge only knows Tailwind's numeric z-index scale, so without
// this a caller's `z-picker-popover` would not replace a component's own
// `z-50`/`z-nav-menu`, and CSS order would pick the winner. Names match
// the layers in waldur-design-tokens/zIndex.css (its zIndex.test.ts keeps them in
// sync).
const Z_INDEX_LAYERS = [
  'sidebar-panel',
  'mobile-drawer',
  'nav-menu',
  'header-popover',
  'popover',
  'dropdown-menu',
  'picker-popover',
  'toast',
  'tooltip',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      z: [{ z: Z_INDEX_LAYERS }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
