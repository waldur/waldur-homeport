import routes from './routes';
import registerSidebarExtension from './sidebar';

export default module => {
  module.config(routes);
  module.run(registerSidebarExtension);
};
