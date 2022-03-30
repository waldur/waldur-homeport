import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect } from 'react';

import { DrawerComponent } from '../../assets/ts/components';
import { useLayout } from '../core';

const Content: React.FC = ({ children }) => {
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
