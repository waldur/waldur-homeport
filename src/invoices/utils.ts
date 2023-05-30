export const formatPeriod = ({ year, month }) =>
  `${year}-${month < 10 ? '0' : ''}${month}`;
