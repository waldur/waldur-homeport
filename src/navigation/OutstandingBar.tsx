import { FC, PropsWithChildren } from 'react';

export const OutstandingBar: FC<PropsWithChildren> = ({ children }) => {
  // Above sticky page content (z-95) and one above the header, so anything
  // opening down from the bar isn't hidden behind it.
  return <div className="outstanding-bar z-101">{children}</div>;
};
