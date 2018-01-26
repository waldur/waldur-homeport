import { get } from '@waldur/core/api';

export const fetchHost = (scope: string) =>
  get('/zabbix-hosts/', {params: {scope}})
    .then(response => response.data)
    .then(list => list[0]);
