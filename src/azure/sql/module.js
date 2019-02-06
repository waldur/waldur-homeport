import './marketplace';
import { AzureSQLServerSummary } from './AzureSQLServerSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default () => {
  ResourceSummary.register('Azure.SQLServer', AzureSQLServerSummary);
};
