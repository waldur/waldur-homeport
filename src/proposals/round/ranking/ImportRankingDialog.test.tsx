import { FORM_ERROR } from 'final-form';
import { describe, expect, it } from 'vitest';

import { importSubmissionErrors } from './ImportRankingDialog';

const refusal = (body: Record<string, unknown>, status = 400) => ({
  ...body,
  status,
  response: { status },
});

describe('importSubmissionErrors', () => {
  it('puts what is wrong with the file under the file field', () => {
    expect(
      importSubmissionErrors(
        refusal({ file: ['The file is larger than 1048576 bytes.'] }),
      ),
    ).toEqual({ file: 'The file is larger than 1048576 bytes.' });
    expect(
      importSubmissionErrors(
        refusal({
          file: [
            'The file has more rows than the round has proposals; at most 23 are read.',
          ],
        }),
      ),
    ).toEqual({
      file: 'The file has more rows than the round has proposals; at most 23 are read.',
    });
  });

  it('shows any other reason above the field', () => {
    expect(
      importSubmissionErrors(refusal({ round: ['Ranking is closed.'] })),
    ).toEqual({ [FORM_ERROR]: 'Ranking is closed.' });
  });

  it('leaves anything but a refused request to the notification', () => {
    expect(
      importSubmissionErrors(refusal({ detail: 'Not found.' }, 404)),
    ).toBeUndefined();
    expect(importSubmissionErrors(new Error('offline'))).toBeUndefined();
  });
});
