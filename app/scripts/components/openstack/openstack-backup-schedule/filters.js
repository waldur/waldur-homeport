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
      return gettext('Every minute');

    case baseFrequency.hour:
      if (minuteValues) {
        return `${gettext('Every hour at')} ${minuteValues} ${gettext('past the hour')}`;
      } else {
        return gettext('Every hour');
      }

    case baseFrequency.day:
      if (angular.isDefined(hourValues)) {
        return `${gettext('Every day')} ${formatTime()}`;
      } else {
        return gettext('Every day');
      }

    case baseFrequency.week:
      if (angular.isDefined(dayValues)) {
        return `${gettext('Every week on')} ${formatDay()} ${formatTime()}`;
      } else {
        return gettext('Every week');
      }

    case baseFrequency.month:
      if (angular.isDefined(dayOfMonthValues)) {
        return `${gettext('Every month on the')} ${formatNumeral()} ${formatTime()}`;
      } else {
        return gettext('Every month');
      }

    case baseFrequency.year:
      if (angular.isDefined(dayOfMonthValues)) {
        return `${gettext('Every month on the')} ${formatNumeral()} of ${formatMonth()} ${formatTime()}`;
      } else {
        return gettext('Every year');
      }

    default:
      return crontab;
    }
  };
}

export default module => {
  module.filter('formatCrontab', formatCrontab);
};
