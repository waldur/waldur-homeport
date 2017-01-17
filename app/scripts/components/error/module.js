import errorRoutes from './routes';
import errorUtilsService from './error-utils-service';
import { error404 } from './error-404';
import { error403 } from './error-403';

export default module => {
  module.config(errorRoutes);
  module.service('errorUtilsService', errorUtilsService);
  module.component('error404', error404);
  module.component('error403', error403);
};
