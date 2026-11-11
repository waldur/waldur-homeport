// Tables nested inside a card on the proposal page.
// Strips the inner table card's horizontal/bottom insets and sets the row edge
// padding to 16.25px, matching the surrounding proposal section chrome.
export const PROPOSAL_FLUSH_TABLE_CLASS = [
  // A card body that opens straight onto one of these tables drops its top
  // inset, which would only push the header band away from the card's rule.
  '[:has(>&:first-child)]:pt-0',
  '[--table-edge-px:16.25px]',
  '[&>[data-slot=card-content]]:[--card-content-px:0px]',
  '[&_[data-slot=card][data-variant=table]>[data-slot=card-content]]:[--card-content-px:0px]',
  '[&:not(:has([data-slot=table-pagination]))>[data-slot=card-content]]:[--card-content-pb:0px]',
  '[&_[data-slot=card][data-variant=table]:not(:has([data-slot=table-pagination]))>[data-slot=card-content]]:[--card-content-pb:0px]',
  '[&_[data-slot=table-responsive]]:border-b',
  '[&_[data-slot=table-responsive]]:border-solid',
  '[&_[data-slot=table-responsive]]:border-secondary',
].join(' ');
