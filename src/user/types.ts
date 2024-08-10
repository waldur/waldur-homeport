import { ReactNode } from 'react';

import { UserDetails } from '@waldur/workspace/types';

export interface SshKey {
  url: string;
  uuid: string;
  name: string;
  public_key: string;
  fingerprint_md5: string;
  fingerprint_sha256: string;
  fingerprint_sha512: string;
  user_uuid: string;
  is_shared: boolean;
  type: string;
}

export interface EditUserProps {
  user: UserDetails;
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  requiredMsg?: string;
  disabled?: boolean;
  protected?: boolean;
  protectedMsg?: string;
  callback(formData, dispatch): Promise<any>;
}
