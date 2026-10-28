import { FunctionComponent } from 'react';

export const GroupHeader: FunctionComponent<{ title }> = ({ title }) => (
  <div style={{ textAlign: 'center', textTransform: 'uppercase', margin: 17 }}>
    {title}
  </div>
);
