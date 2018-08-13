import * as moment from 'moment-timezone';

export function getTimezoneItems() {
  const date = new Date();
  const timestamp = date.getTime();
  return moment.tz
    .names()
    .map(timezone => getTimezoneMetadata(timezone, timestamp))
    .sort((a, b) => a.offset - b.offset);
}

function getTimezoneMetadata(timezone: string, timestamp: number) {
  const zonedDate = moment.tz(timestamp, timezone);
  const offset = zonedDate.utcOffset();
  const offsetAsString = zonedDate.format('Z');

  return {
    offset,
    value: timezone,
    display_name: `${timezone} (UTC${offsetAsString})`,
  };
}
