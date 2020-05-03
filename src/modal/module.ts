import confirmationDialog from './ConfirmationDialog';
import injectServices from './services';

export default module => {
  module.run(injectServices);
  module.component('confirmationDialog', confirmationDialog);
};
