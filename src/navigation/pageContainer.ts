/**
 * The page's horizontal frame, in place of Bootstrap's `.container-fluid`
 * with the padding Metronic gave it (layout/_main.scss): full width and
 * centred, 15px side padding, 32px from lg. In print it drops its padding,
 * margin and background, as print mode did for the Bootstrap containers.
 */
export const PAGE_CONTAINER_CLASSNAME =
  'w-full mx-auto px-[15px] lg:px-[32px] print:p-[0px] print:m-[0px] print:bg-transparent print:bg-none';

/**
 * Bootstrap's `.container`: the same frame, capped at Bootstrap's container
 * widths from lg (below lg Metronic let it run full width).
 */
export const PAGE_CONTAINER_BOUNDED_CLASSNAME = `${PAGE_CONTAINER_CLASSNAME} lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]`;

/**
 * Bootstrap's `.container-xxl`: the same frame, capped at 1320px from 2xl
 * (1400px).
 */
export const PAGE_CONTAINER_XXL_CLASSNAME = `${PAGE_CONTAINER_CLASSNAME} 2xl:max-w-[1320px]`;
