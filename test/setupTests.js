import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/dom';
import 'vitest-location-mock';

configure({ asyncUtilTimeout: 5000 });

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
