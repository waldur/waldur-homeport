import { translate } from '@waldur/i18n';
import { ActionContext } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

export function isBootable(ctx: ActionContext<Volume>): string {
  if (ctx.resource.bootable) {
    return translate(`System volume couldn't be detached.`);
  }
}

export function hasBackendId(ctx: ActionContext<Volume>): string {
  if (!ctx.resource.backend_id) {
    return translate('Resource does not have backend ID.');
  }
}
