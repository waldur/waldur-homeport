import { ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { wait } from './utils';

// Taken from https://github.com/enzymejs/enzyme/issues/2073
// Use this in your test after mounting if you need just need to let the query finish without updating the wrapper
export async function actWait(amount = 0) {
  await act(async () => {
    await wait(amount);
  });
}

export async function updateWrapper<P = {}>(
  wrapper: ReactWrapper<P>,
  amount = 0,
) {
  await act(async () => {
    await wait(amount);
    wrapper.update();
  });
}

export function findButtonByText(wrapper: ReactWrapper, text: string) {
  return wrapper.findWhere(
    (node) => node.type() === 'button' && node.text().trim() === text,
  );
}
