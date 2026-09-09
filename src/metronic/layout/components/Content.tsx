import { PropsWithChildren } from 'react';

import { useLayout } from '../core';

const Content: React.FC<PropsWithChildren> = ({ children }) => {
  const { classes } = useLayout();

  return (
    <div
      id="kt_content_container"
      className={classes.contentContainer.join(' ')}
    >
      {children}
    </div>
  );
};

export { Content };
