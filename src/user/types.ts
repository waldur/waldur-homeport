export interface SshKey {
  url: string;
  uuid: string;
  name: string;
  public_key: string;
  fingerprint: string;
  user_uuid: string;
  is_shared: boolean;
  type: string;
}
