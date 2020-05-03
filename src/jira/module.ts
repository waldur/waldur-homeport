import jiraIssueModule from './issue/module';
import jiraProjectModule from './project/module';
import './provider';

export default module => {
  jiraProjectModule(module);
  jiraIssueModule(module);
};
