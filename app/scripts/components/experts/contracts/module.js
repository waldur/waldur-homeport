import expertContractCreate from './expert-contract-create';
import expertContractForm from './expert-contract-form';
import expertContractDetails from './expert-contract-details';
import expertContract from './expert-contract';
import expertContractSection from './expert-contract-section';

export default module => {
  module.component('expertContractForm', expertContractForm);
  module.component('expertContractCreate', expertContractCreate);
  module.component('expertContractDetails', expertContractDetails);
  module.component('expertContract', expertContract);
  module.component('expertContractSection', expertContractSection);
};
