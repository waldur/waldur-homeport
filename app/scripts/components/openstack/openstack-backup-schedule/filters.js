// @ngInject
function formatCrontab(cronService, baseFrequency, $filter, coreUtils) {
  return function(crontab) {
    const schedule = cronService.fromCron(crontab, false);
    const { base, minuteValues, hourValues, dayOfMonthValues, dayValues, monthValues } = schedule;

    const formatTime = () => `at ${hourValues}:${minuteValues}`;
    const formatDay = () => $filter('cronDayName')(dayValues);
    const formatMonth = () => $filter('cronMonthName')(monthValues);
    const formatNumeral = () => $filter('cronNumeral')(dayOfMonthValues);

    switch(base) {
    case baseFrequency.minute:
      return $filter('translate')(gettext('Every minute'));

    case baseFrequency.hour:
      if (minuteValues) {
        return coreUtils.templateFormatter(gettext('Every hour at {minuteValues} past the hour'),
          {minuteValues: minuteValues});
      } else {
        return $filter('translate')(gettext('Every hour'));
      }

    case baseFrequency.day:
      if (angular.isDefined(hourValues)) {
        return `${gettext('Every day')} ${formatTime()}`;
      } else {
        return $filter('translate')(gettext('Every day'));
      }

    case baseFrequency.week:
      if (angular.isDefined(dayValues)) {
        return coreUtils.templateFormatter(gettext('Every week on {day} {time}'),
          { day: formatDay(), time: formatTime() });
      } else {
        return $filter('translate')(gettext('Every week'));
      }

    case baseFrequency.month:
      if (angular.isDefined(dayOfMonthValues)) {
        return coreUtils.templateFormatter(gettext('Every month on the {days} {time}'),
          { days: formatNumeral(), time: formatTime() });
      } else {
        return $filter('translate')(gettext('Every month'));
      }

    case baseFrequency.year:
      if (angular.isDefined(dayOfMonthValues)) {
        return coreUtils.templateFormatter(gettext('Every month on the {days} of {months} {time}'),
          { days: formatNumeral(), months: formatMonth(), time: formatTime() });
      } else {
        return $filter('translate')(gettext('Every year'));
      }

    default:
      return crontab;
    }
  };
}

export default module => {
  module.filter('formatCrontab', formatCrontab);
};
