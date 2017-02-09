import template from './crontab-field.html';

const frequencyChoices = [
  {
    value: 'hourly',
    label: 'Hourly',
    interval: 'hour',
    intervalPlural: 'hours',
  },
  {
    value: 'daily',
    label: 'Daily',
    interval: 'day',
    intervalPlural: 'days',
  },
  {
    value: 'weekly',
    label: 'Weekly',
    interval: 'week',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    interval: 'month',
    intervalPlural: 'months',
  },
  {
    value: 'custom',
    label: 'Custom'
  },
];

const weekdayChoices = [
  {
    value: 'MON',
    label: 'Monday',
    selected: true
  },
  {
    value: 'TUE',
    label: 'Tuesday'
  },
  {
    value: 'WED',
    label: 'Wednesday'
  },
  {
    value: 'THU',
    label: 'Thursday'
  },
  {
    value: 'FRI',
    label: 'Friday'
  },
  {
    value: 'SAT',
    label: 'Saturday'
  },
  {
    value: 'SUN',
    label: 'Sunday'
  }
];

const crontabField = {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class CrontabFieldController {
    constructor($scope) {
      this.$scope = $scope;
    }

    $onInit() {
      this.interval = 1;
      this.day = 1;
      this.frequencyChoices = angular.copy(frequencyChoices);
      this.weekdayChoices = angular.copy(weekdayChoices);
      this.frequency = this.frequencyChoices[2];

      this.$scope.$watch(() => ({
        interval: this.interval,
        day: this.day,
        frequency: this.frequency,
        weekdayChoices: this.weekdayChoices,
        customValue: this.customValue,
      }), () => this.model[this.field.name] = this.getCrontab(), true);
    }

    showInterval() {
      return this.frequency.value === 'hourly' || this.frequency.value === 'daily';
    }

    getIntervalDisplay() {
      const { interval, frequency } = this;
      if (interval === 1) {
        return frequency.interval;
      } else {
        return frequency.intervalPlural;
      }
    }

    getCrontab() {
      /* Crontab spec consists of 5 parts:

       ┌───────────── minute (0 - 59)
       │ ┌───────────── hour (0 - 23)
       │ │ ┌───────────── day of month (1 - 31)
       │ │ │ ┌───────────── month (1 - 12)
       │ │ │ │ ┌───────────── day of week (0 - 6)
       │ │ │ │ │
       │ │ │ │ │
       │ │ │ │ │
       * * * * *  command to execute

      */
      const { interval, day, frequency } = this;
      const formattedInterval = this.formatInterval(interval);

      switch(frequency.value) {
      case 'hourly':
        return `0 ${formattedInterval} * * *`;

      case 'daily':
        return `0 0 ${formattedInterval} * *`;

      case 'weekly':
        return `0 0 * * ${this.formatWeekdays()}`;

      case 'monthly':
        return `0 0 ${day} ${formattedInterval} *`;

      case 'custom':
        return this.customValue;
      }
    }

    formatInterval(interval) {
      if (interval === 1) {
        return '*';
      } else {
        return `*/${interval}`;
      }
    }

    formatWeekdays() {
      const selected = this.weekdayChoices
        .filter(choice => choice.selected)
        .map(choice => choice.value);

      if (selected.length === 0) {
        return 0;
      } else {
        return selected.join(',');
      }
    }
  }
};

export default crontabField;
