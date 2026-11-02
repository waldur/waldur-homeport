import { formatAnnotatedValue } from './annotated';
import { formatBadgeListValue, formatBadgeValue } from './badge';
import { formatBooleanValue } from './boolean';
import {
  formatEnumValue,
  formatJsonValue,
  formatRichTextValue,
  formatSecretValue,
} from './content';
import { formatDateValue } from './date';
import {
  formatCustomValue,
  formatMetricValue,
  formatPairValue,
  formatQuotaValue,
} from './extra';
import { formatFileValue, formatLinkValue, formatUrlValue } from './link';
import { formatListValue } from './list';
import {
  formatDurationValue,
  formatFileSizeValue,
  formatPercentValue,
} from './measure';
import { formatMeterValue } from './meter';
import {
  formatCountValue,
  formatCurrencyValue,
  formatNumberValue,
} from './number';
import { formatStateValue } from './state';
import { formatCodeValue, formatTextValue } from './text';
import { formatUserValue } from './user';

export const propVal = {
  annotated: formatAnnotatedValue,
  badge: formatBadgeValue,
  badgeList: formatBadgeListValue,
  boolean: formatBooleanValue,
  code: formatCodeValue,
  count: formatCountValue,
  currency: formatCurrencyValue,
  custom: formatCustomValue,
  date: formatDateValue,
  duration: formatDurationValue,
  enum: formatEnumValue,
  file: formatFileValue,
  fileSize: formatFileSizeValue,
  json: formatJsonValue,
  link: formatLinkValue,
  list: formatListValue,
  meter: formatMeterValue,
  metric: formatMetricValue,
  money: formatCurrencyValue,
  number: formatNumberValue,
  pair: formatPairValue,
  percent: formatPercentValue,
  quota: formatQuotaValue,
  richText: formatRichTextValue,
  secret: formatSecretValue,
  state: formatStateValue,
  text: formatTextValue,
  url: formatUrlValue,
  user: formatUserValue,
};
