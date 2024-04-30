import { useCurrentStateAndParams } from '@uirouter/react';
import { PropsWithChildren, useEffect } from 'react';

import { DrawerComponent } from '../../components';
import { useLayout } from '../core';

const Content: React.FC<PropsWithChildren> = ({ children }) => {
  const { classes } = useLayout();
  const { state } = useCurrentStateAndParams();
  useEffect(() => {
    DrawerComponent.hideAll();
  }, [state]);

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
