import { ResourceAction } from '@waldur/resource/actions/types';

import { mergeActions } from './utils';

describe('Marge action', () => {
  const base: ResourceAction = {
    name: 'backup',
    type: 'form',
    method: 'POST',
    title: 'Create backup',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'string',
      },
    ],
  };
  const enhancer = {
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'string',
        pattern: '[A-Za-z]+',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
      },
    ],
  };
  const expected = {
    name: 'backup',
    type: 'form',
    method: 'POST',
    title: 'Create backup',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'string',
        pattern: '[A-Za-z]+',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
      },
    ],
  };
  it('merges actions and its fields', () => {
    const actual = mergeActions(base, enhancer);
    expect(actual).toEqual(expected);
  });

  it('skips empty argument', () => {
    expect(mergeActions(base, {})).toEqual(base);
  });
});
