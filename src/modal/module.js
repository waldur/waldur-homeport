import injectServices from './services';
import confirmationDialog from './ConfirmationDialog';

export default module => {
  module.run(injectServices);
  module.component('confirmationDialog', confirmationDialog);
};
