import { ActionConfiguration } from '@/resource/actions/types';

import { AZURE_SQL_TYPE } from '../constants';

import { DestroyServerAction } from './DestroyServerAction';

export const AzureSqlServerActions: ActionConfiguration = {
  type: AZURE_SQL_TYPE,
  actions: [DestroyServerAction],
};
