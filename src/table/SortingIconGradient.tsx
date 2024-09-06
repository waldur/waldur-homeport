export const SortingIconGradient = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    style={{ width: 0, height: 0, position: 'absolute' }}
  >
    <linearGradient id="sorting-gradient-asc" x2="0" y2="1">
      <stop offset="49%" stopColor="var(--bs-primary)" />
      <stop offset="50%" stopColor="var(--bs-grey-300)" />
    </linearGradient>
    <linearGradient id="sorting-gradient-desc" x2="0" y2="1">
      <stop offset="49%" stopColor="var(--bs-grey-300)" />
      <stop offset="50%" stopColor="var(--bs-primary)" />
    </linearGradient>
  </svg>
);
