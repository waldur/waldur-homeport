import * as moment from 'moment';

type DateFormatter = (date: Date | string) => string;

export const formatDate: DateFormatter = date =>
  moment(date).format('YYYY-MM-DD');

export const formatDateTime: DateFormatter = date =>
  moment(date).format('YYYY-MM-DD HH:mm');

export const formatFromNow: DateFormatter = date =>
  moment(date).fromNow();

export const formatRelative: DateFormatter = date =>
  moment(date).fromNow(true);
