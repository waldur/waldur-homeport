import issueListModule from './list/module';
import issueWorkspaceModule from './workspace/module';
import './events';

export default (module) => {
  issueListModule(module);
  issueWorkspaceModule(module);
};
