import { getFirst } from '@waldur/core/api';

export const fetchHost = (scope: string) => getFirst('/zabbix-hosts/', {scope});
