import { LinkIcon } from '@phosphor-icons/react';
import type { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { DropdownActionItemType } from '@/table/types';

const LinkArrowLicenseDialog = lazyComponent(() =>
  import('./LinkArrowLicenseDialog').then((module) => ({
    default: module.LinkArrowLicenseDialog,
  })),
);

export const LinkArrowLicenseAction: DropdownActionItemType<Resource> = ({
  row,
  refetch,
}) => (
  <DialogActionItem
    title={translate('Link to Arrow license')}
    modalComponent={LinkArrowLicenseDialog}
    resource={row}
    extraResolve={{ refetch }}
    iconNode={<LinkIcon weight="bold" />}
  />
);
