import marketplaceChecklistProject from './ProjectChecklist';
import routes from './routes';
import registerSidebarExtension from './sidebar-extension';

export default module => {
  module.config(routes);
  module.run(registerSidebarExtension);
  module.component('marketplaceChecklistProject', marketplaceChecklistProject);
};
