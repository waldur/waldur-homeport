import { titleCase } from '@waldur/core/utils';

export const getKeyTitle = (key) =>
  titleCase(key.toLowerCase().replaceAll('_', ' '));
