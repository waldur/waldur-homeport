import { transformRows } from '@waldur/table-react/utils';

describe('transformRows', () => {
  it('should return object with entities and order properties', () => {
    const rows = [
      {
        uuid: 1,
        userName: 'Daniel',
        email: 'daniel@gmail.com',
      },
      {
        uuid: 2,
        userName: 'Alice',
        email: 'alice@gmail.com',
      },
    ];
    const expected = {
      entities: {
        1: {
          uuid: 1,
          userName: 'Daniel',
          email: 'daniel@gmail.com',
        },
        2: {
          uuid: 2,
          userName: 'Alice',
          email: 'alice@gmail.com',
        },
      },
      order: [1, 2],
    };
    expect(transformRows(rows)).toEqual(expected);
  });
});
