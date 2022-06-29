import { ServerGroupType } from '../types';

export type ServerGroup = ServerGroupType;

export interface ServerGroupOption extends ServerGroup {
  clearableValue?: boolean;
}
