import * as ResourceSummary from '@waldur/resource/summary/registry';

import { JiraIssueSummary } from './JiraIssueSummary';
import './tabs';

export default () => {
  ResourceSummary.register('JIRA.Issue', JiraIssueSummary);
};
