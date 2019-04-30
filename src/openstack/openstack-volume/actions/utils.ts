import { translate } from '@waldur/i18n';
import { Volume } from '@waldur/resource/types';

export function isBootable({resource}: {resource: Volume}): string {
    if (resource.bootable) {
        return translate(`System volume couldn't be detached.`);
    }
}

export function hasBackendId({resource}: {resource: Volume}): string {
    if (!resource.backend_id) {
        return translate('Resource does not have backend ID.');
    }
}
