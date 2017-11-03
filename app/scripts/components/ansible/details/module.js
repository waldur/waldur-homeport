import ansibleJobDetails from './ansible-job-details';
import ansibleJobResourcesList from './ansible-job-resources';
import ansibleJobSummary from './ansible-job-summary';

export default module => {
  module.component('ansibleJobDetails', ansibleJobDetails);
  module.component('ansibleJobResourcesList', ansibleJobResourcesList);
  module.component('ansibleJobSummary', ansibleJobSummary);
};
