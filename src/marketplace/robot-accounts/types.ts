import { SshKey } from '@waldur/user/types';

export interface RobotAccount {
  fingerprints: string[];
  user_keys: SshKey[];
  users: { username: string; full_name: string; uuid: string }[];
}
