// The half-height carets of a sortable column header and of a pair of
// up/down buttons: two of them stack into the height of one icon.

export const CaretUpSmallIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="8"
    fill="currentColor"
    viewBox="0 0 256 128"
  >
    <path d="M 126 45 l 39.51 39.52 a 12 12 0 0 0 17 -17 l -48 -48 a 12 12 0 0 0 -17 0 l -48 48 a 12 12 0 0 0 17 17 Z" />
  </svg>
);

export const CaretDownSmallIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="8"
    fill="currentColor"
    viewBox="0 0 256 128"
  >
    <path d="M 184.49 39.51 a 12 12 0 0 1 0 17 l -48 48 a 12 12 0 0 1 -17 0 l -48 -48 a 12 12 0 0 1 17 -17 L 128 79 l 39.51 -39.52 A 12 12 0 0 1 184.49 39.51 Z" />
  </svg>
);
