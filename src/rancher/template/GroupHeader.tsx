import { FunctionComponent } from 'react';

export const GroupHeader: FunctionComponent<{ title }> = ({ title }) => (
  <div className="text-center uppercase m-[17px]">{title}</div>
);
