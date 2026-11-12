// What NoResult and ErrorView share: the rings behind the icon, the icon's
// place under them and the heading. (Formerly NoResult.scss.)

/** Inside an expanded table row the block sits 13px higher, under the row. */
export const STATE_ROOT_CLASSNAME =
  'relative overflow-hidden in-data-[slot=expanded-row-content]:-mt-3.25';

/** Centred at the top, fading out over the upper three quarters. */
export const STATE_BACKGROUND_CLASSNAME =
  'absolute top-0 left-1/2 w-131 -translate-x-1/2 mask-b-from-0% mask-b-to-75%';

export const STATE_ICON_CLASSNAME = 'mt-11.25 mb-4';

export const STATE_TITLE_CLASSNAME = 'mb-1 leading-6 font-medium';
