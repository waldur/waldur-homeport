// @ngInject
function formatCrontab(cronService, baseFrequency, $filter) {
  return function(crontab) {
    const schedule = cronService.fromCron(crontab, false);
    const { base, minuteValues, hourValues, dayOfMonthValues, dayValues, monthValues } = schedule;

    const formatTime = () => `at ${hourValues}:${minuteValues}`;
    const formatDay = () => $filter('cronDayName')(dayValues);
    const formatMonth = () => $filter('cronMonthName')(monthValues);
    const formatNumeral = () => $filter('cronNumeral')(dayOfMonthValues);

    switch(base) {
    case baseFrequency.minute:
      return 'Every minute';

    case baseFrequency.hour:
      if (minuteValues) {
        return `Every hour at ${minuteValues} past the hour`;
      } else {
        return 'Every hour';
      }

    case baseFrequency.day:
      if (angular.isDefined(hourValues)) {
        return `Every day ${formatTime()}`;
      } else {
        return 'Every day';
      }

    case baseFrequency.week:
      if (angular.isDefined(dayValues)) {
        return `Every week on ${formatDay()} ${formatTime()}`;
      } else {
        return 'Every week';
      }

    case baseFrequency.month:
      if (angular.isDefined(dayOfMonthValues)) {
        return `Every month on the ${formatNumeral()} ${formatTime()}`;
      } else {
        return 'Every month';
      }

    case baseFrequency.year:
      if (angular.isDefined(dayOfMonthValues)) {
        return `Every month on the ${formatNumeral()} of ${formatMonth()} ${formatTime()}`;
      } else {
        return 'Every year';
      }

    default:
      return crontab;
    }
  };
}

export default module => {
  module.filter('formatCrontab', formatCrontab);
};
