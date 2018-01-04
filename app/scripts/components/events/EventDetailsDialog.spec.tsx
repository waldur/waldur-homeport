import * as React from 'react';

import { testFullSnapshot, testShallowSnapshot } from '@waldur/core/testUtils';
import { Translate, formatTemplate } from '@waldur/i18n';

import { EventDetailsDialog } from './EventDetailsDialog';
import { event1 } from './fixtures';

jest.mock('@waldur/core/services', () => ({
  $state: {
    href: x => x,
  },
}));

const translate: Translate = formatTemplate;

describe('EventDetailsDialog', () => {
  it('renders shallow with ordinary values as expected', () => {
    testShallowSnapshot(<EventDetailsDialog translate={translate} resolve={{ event: event1 }} />);
  });

  it('renders fully with ordinary values as expected', () => {
    testFullSnapshot(<EventDetailsDialog translate={translate} resolve={{ event: event1 }} />);
  });
});
