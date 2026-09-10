import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/dom';
import 'vitest-location-mock';
import { afterAll } from 'vitest';

configure({ asyncUtilTimeout: 5000 });

// react-bootstrap transitions (Collapse, Fade, Modal) end on a fallback timer
// from dom-helpers that fires ~5 ms after they start. When a file's last test
// ends mid-transition, that timer can fire after jsdom is torn down and fail
// the whole run with "document is not defined", even though every test passed.
// Coverage collection used to delay teardown long enough to hide this. Letting
// pending timers run before teardown closes the gap for every file. The real
// setTimeout is captured here so a test that leaves fake timers on cannot
// stall the hook.
const realSetTimeout = globalThis.setTimeout;
afterAll(() => new Promise((resolve) => realSetTimeout(resolve, 20)));

import './mocks/router';
import './mocks/icons';
import './mocks/modal';
import './mocks/notify';
import './mocks/workspace';
import './mocks/i18n';
import './mocks/monaco';
import './mocks/config';
import './mocks/echarts';
import './mocks/markdown';
import './mocks/date';
import './mocks/svg';
