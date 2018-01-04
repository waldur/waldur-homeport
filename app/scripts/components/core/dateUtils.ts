import * as moment from 'moment';

type DateFormatter = (date: Date | string) => string;

export const formatDate: DateFormatter = date => {
  if (date) {
    return moment(date).format('YYYY-MM-DD');
  }
  return undefined;
};

export const formatDateTime: DateFormatter = date => {
  if (date) {
    return moment(date).format('YYYY-MM-DD HH:mm');
  }
  return undefined;
};

export const formatFromNow: DateFormatter = date => {
  if (date) {
    return moment(date).fromNow();
  }
  return undefined;
};

export const formatRelative: DateFormatter = date => {
  if (date) {
    return moment(date).fromNow(true);
  }
  return undefined;
};

export const formatMediumDateTime: DateFormatter = date => {
  if (date) {
    return moment(date).format('MMM D, Y h:mm:ss A');
  }
  return undefined;
};
