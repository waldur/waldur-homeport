import providersService from './providers-service';
import routes from './routes';
import registerSidebarExtension from './sidebar';

export default module => {
  module.service('providersService', providersService);
  module.config(routes);
  module.run(registerSidebarExtension);
};
