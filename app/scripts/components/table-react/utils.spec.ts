import { transformRows } from '@waldur/table-react/utils';

describe('transformRows', () => {
  it('should return object with entities and order properties by UUID', () => {
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

  it('should return object with entities and order properties by PK', () => {
    const rows = [
      {
        pk: 1,
        userName: 'Daniel',
        email: 'daniel@gmail.com',
      },
      {
        pk: 2,
        userName: 'Alice',
        email: 'alice@gmail.com',
      },
    ];
    const expected = {
      entities: {
        1: {
          pk: 1,
          userName: 'Daniel',
          email: 'daniel@gmail.com',
        },
        2: {
          pk: 2,
          userName: 'Alice',
          email: 'alice@gmail.com',
        },
      },
      order: [1, 2],
    };
    expect(transformRows(rows)).toEqual(expected);
  });

  it('should return object with entities and order properties by dynamically generated INDEX', () => {
    const rows = [
      {
        userName: 'Daniel',
        email: 'daniel@gmail.com',
      },
      {
        userName: 'Alice',
        email: 'alice@gmail.com',
      },
    ];
    const expected = {
      entities: {
        0: {
          userName: 'Daniel',
          email: 'daniel@gmail.com',
        },
        1: {
          userName: 'Alice',
          email: 'alice@gmail.com',
        },
      },
      order: [0, 1],
    };
    expect(transformRows(rows)).toEqual(expected);
  });
});
