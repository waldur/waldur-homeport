import errorRoutes from './routes';
import invalidObjectPage from './invalid-object-page';
import invalidQuotaPage from './invalid-quota-page';
import invalidRoutePage from './invalid-route-page';

export default module => {
  module.config(errorRoutes);
  module.component('invalidObjectPage', invalidObjectPage);
  module.component('invalidQuotaPage', invalidQuotaPage);
  module.component('invalidRoutePage', invalidRoutePage);
};
