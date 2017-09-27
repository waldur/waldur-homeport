import expertContractCreate from './expert-contract-create';
import expertContractForm from './expert-contract-form';

export default module => {
  module.component('expertContractForm', expertContractForm);
  module.component('expertContractCreate', expertContractCreate);
};
