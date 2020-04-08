import { connectAngularComponent } from '@waldur/store/connect';

import { InvalidObjectPage } from './InvalidObjectPage';
import { InvalidQuotaPage } from './InvalidQuotaPage';
import { InvalidRoutePage } from './InvalidRoutePage';
import errorRoutes from './routes';

export default module => {
  module.config(errorRoutes);
  module.component(
    'invalidObjectPage',
    connectAngularComponent(InvalidObjectPage),
  );
  module.component(
    'invalidQuotaPage',
    connectAngularComponent(InvalidQuotaPage),
  );
  module.component(
    'invalidRoutePage',
    connectAngularComponent(InvalidRoutePage),
  );
};
