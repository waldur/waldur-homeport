import { formatFlavor } from './utils';
import { formatCrontab } from './crontab';

export default module => {
  module.filter('formatFlavor', () => formatFlavor);
  module.filter('formatCrontab', () => formatCrontab);
};
