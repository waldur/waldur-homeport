import template from './slurm-allocation-details-dialog.html';
import { getRandomDataset } from '../core/fixtures';

function getBarChartData() {
  const users = ['Alice', 'Bob', 'Charlie'];
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const palette = ['#23c6c8', '#93a1a1', '#eee8d5', '#1ab394', '#1c84c6', '#f8ac59'];

  let datasets = [];
  users.map((user, index) => {
    datasets.push({
      label: user,
      data: getRandomDataset(labels.length, 0, 1024),
      backgroundColor: palette[index]
    });
  });

  return { labels, datasets };
}

class SlurmAllocationDetailsDialogController {
  $onInit() {
    this.charts = [
      {
        name: gettext('CPU usage'),
        items: getBarChartData(),
      },
      {
        name: gettext('GPU usage'),
        items: getBarChartData(),
      },
      {
        name: gettext('RAM usage'),
        items: getBarChartData(),
      },
    ];
  }
}

const slurmAllocationDetailsDialog = {
  template,
  controller: SlurmAllocationDetailsDialogController,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  }
};

export default slurmAllocationDetailsDialog;
