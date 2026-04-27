import { FunctionComponent } from 'react';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

import { EDIT_COMPONENT_FORM_ID } from './constants';

const EditComponentDialog = lazyComponent(() =>
  import('./EditComponentDialog').then((module) => ({
    default: module.EditComponentDialog,
  })),
);

export const EditComponentButton: FunctionComponent<{
  offering;
  component;
  refetch;
}> = ({ offering, component, refetch }) => (
  <EditModalButton
    dialog={EditComponentDialog}
    row={component}
    buildResolve={(r) => ({ offering, component: r, refetch })}
    formId={EDIT_COMPONENT_FORM_ID}
  />
);
