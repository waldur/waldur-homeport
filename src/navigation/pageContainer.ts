/**
 * The page's horizontal frame: full width and
 * centred, 15px side padding, 32px from lg. In print it drops its padding,
 * margin and background.
 */
export const PAGE_CONTAINER_CLASSNAME =
  'w-full mx-auto px-[15px] lg:px-[32px] print:p-[0px] print:m-[0px] print:bg-transparent print:bg-none';

/**
 * Bounded container: the same frame, capped at container
 * widths from lg.
 */
export const PAGE_CONTAINER_BOUNDED_CLASSNAME = `${PAGE_CONTAINER_CLASSNAME} lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]`;

/**
 * XXL container: the same frame, capped at 1320px from 2xl
 * (1400px).
 */
export const PAGE_CONTAINER_XXL_CLASSNAME = `${PAGE_CONTAINER_CLASSNAME} 2xl:max-w-[1320px]`;
