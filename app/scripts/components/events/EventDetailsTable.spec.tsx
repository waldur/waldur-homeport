import * as React from 'react';

import { testShallowSnapshot } from '@waldur/core/testUtils';
import { Translate, formatTemplate } from '@waldur/i18n';

import { EventDetailsTable } from './EventDetailsTable';
import { event1 } from './fixtures';

jest.mock('@waldur/core/services', () => ({
  $state: {
    href: x => x,
  },
}));

const translate: Translate = formatTemplate;

describe('EventDetailsDialog', () => {
  it('renders shallow with ordinary values as expected', () => {
    testShallowSnapshot(<EventDetailsTable translate={translate} event={event1} />);
  });
});
