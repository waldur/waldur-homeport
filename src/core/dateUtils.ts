import * as moment from 'moment-timezone';

type DateFormatter = (date?: moment.MomentInput) => string;

export const formatDate: DateFormatter = date =>
  moment(date).format('YYYY-MM-DD');

export const formatDateTime: DateFormatter = date =>
  moment(date).format('YYYY-MM-DD HH:mm');

export const formatTime: DateFormatter = date => moment(date).format('HH:mm');

export const formatFromNow: DateFormatter = date => moment(date).fromNow();

export const formatRelative: DateFormatter = date => moment(date).fromNow(true);

export const formatMediumDateTime: DateFormatter = date =>
  moment(date).format('MMM D, Y h:mm:ss A');

export const formatShortDateTime: DateFormatter = date =>
  moment.utc(date).format('MMM D, HH:mm');
