import * as ResourceSummary from '@waldur/resource/summary/registry';

import jiraProjectCheckoutSummary from './jira-project-checkout-summary';
import { JiraProjectSummary } from './JiraProjectSummary';
import './tabs';

export default module => {
  ResourceSummary.register('JIRA.Project', JiraProjectSummary);
  module.component('jiraProjectCheckoutSummary', jiraProjectCheckoutSummary);
};
