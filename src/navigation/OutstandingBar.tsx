import { FC, PropsWithChildren } from 'react';

export const OutstandingBar: FC<PropsWithChildren> = ({ children }) => {
  return <div className="outstanding-bar">{children}</div>;
};
