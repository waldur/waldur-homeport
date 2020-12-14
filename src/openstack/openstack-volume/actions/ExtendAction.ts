import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

const VolumeExtendDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "VolumeExtendDialog" */ '../VolumeExtendDialog'
    ),
  'VolumeExtendDialog',
);

import { isBootable } from './utils';

export default function createAction(): ResourceAction<Volume> {
  return {
    name: 'extend',
    type: 'form',
    method: 'POST',
    component: VolumeExtendDialog,
    title: translate('Extend'),
    validators: [isBootable, validateState('OK')],
    fields: [],
  };
}
