import template from './slurm-allocation-usage-table.html';
import './slurm-allocation-usage-table.scss';
import { getRandomDataset } from '../core/fixtures';

function getBarChartData(users) {
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  let datasets = [];
  users.map(user => {
    const label = user.full_name;
    const data = getRandomDataset(labels.length, 0, 1024);
    const backgroundColor = user.color;
    datasets.push({ label, data, backgroundColor });
  });

  return { labels, datasets };
}

class SlurmAllocationUsageTableController {
  $onInit() {
    this.users = [
      {
        full_name: 'Alice Lebowski',
        color: '#23c6c8',
        freeipa_name: 'waldur_user_alice'
      },
      {
        full_name: 'Bob Lebowski',
        color: '#eee8d5',
        freeipa_name: 'waldur_user_bob'
      },
      {
        full_name: 'Charlie Lebowski',
        color: '#1c84c6',
        freeipa_name: 'waldur_user_charlie'
      }
    ];
    this.charts = [
      {
        name: gettext('Costs'),
        items: getBarChartData(this.users),
      },
      {
        name: gettext('CPU usage'),
        items: getBarChartData(this.users),
      },
      {
        name: gettext('GPU usage'),
        items: getBarChartData(this.users),
      },
      {
        name: gettext('RAM usage'),
        items: getBarChartData(this.users),
      },
    ];
  }
}

const slurmAllocationUsageTable = {
  template,
  bindings: {
    resource: '<'
  },
  controller: SlurmAllocationUsageTableController
};

export default slurmAllocationUsageTable;
