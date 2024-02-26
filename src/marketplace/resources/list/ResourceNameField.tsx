import { FunctionComponent } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { Customer } from '@waldur/workspace/types';

import { Resource } from '../types';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
  customer?: Customer;
}

export const ResourceNameField: FunctionComponent<ResourceNameFieldProps> = ({
  row,
  customer,
}) => {
  return (
    <>
      <PublicResourceLink row={row} customer={customer} />
      <CopyToClipboardButton
        value={row.name}
        className="ms-2 text-hover-primary cursor-pointer d-inline-block"
      />
    </>
  );
};
