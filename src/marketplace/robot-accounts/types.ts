import { SshKey } from '@waldur/user/types';

export interface RobotAccount {
  fingerprints: { md5: string; sha256: string; sha512: string }[];
  keys: string[];
  user_keys: SshKey[];
  users: { username: string; full_name: string; uuid: string }[];
}
