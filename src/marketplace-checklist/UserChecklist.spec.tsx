import { mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { AnswersSummary } from './AnswersSummary';
import { AnswersTable } from './AnswersTable';
import { PieChart } from './PieChart';
import { UserChecklist } from './UserChecklist';

jest.mock('@waldur/store/coreSaga', () => ({
  showSuccess: jest.fn(() => ({ type: 'mock-success' })),
  showError: jest.fn(() => ({ type: 'mock-error' })),
}));

jest.mock('@waldur/core/EChart', () => ({
  EChart: jest.fn(() => null),
}));

jest.mock('@uirouter/react', () => ({
  useCurrentStateAndParams: jest
    .fn()
    .mockReturnValue({ params: { category: 'mock-category' } }),
  UISref: jest.fn(() => null),
}));

jest.mock('@waldur/i18n', () => ({
  translate: jest.fn().mockImplementation((arg) => arg),
}));

const checklist = [
  {
    uuid: '51525237e3bc40879c437f5d4d3be850',
    name: 'Best practices (2 questions)',
    description: '',
    questions_count: 2,
    category_name: 'Project checklist',
    category_uuid: '7fd33c0055d8453d84e4da5371dd8fab',
  },
  {
    uuid: '407296c2821345aab0f02a583293a476',
    name: 'Cyberhygiene (2 questions)',
    description: '',
    questions_count: 2,
    category_name: 'Project checklist',
    category_uuid: '7fd33c0055d8453d84e4da5371dd8fab',
  },
];

const questions = [
  {
    uuid: '554b3673d2f944299057143fa62be3ef',
    description: 'I assign PIDs to all my generated resources',
    solution: 'Please see RDA recommendations here and here',
    correct_answer: true,
  },
  {
    uuid: '4472d7df987644f39804cb7dbdbc2e6e',
    description: 'I preserve data in a storage with SLAs on preservation',
    solution: 'Find a service provider to use for keeping artifacts.',
    category_uuid: '6dfcdbe3c18241dc87526ef411bf6064',
    correct_answer: true,
  },
];

const answers = [
  {
    question_uuid: '554b3673d2f944299057143fa62be3ef',
    value: false,
  },
  {
    question_uuid: '4472d7df987644f39804cb7dbdbc2e6e',
    value: true,
  },
];

const category = {
  uuid: '7fd33c0055d8453d84e4da5371dd8fab',
  icon: null,
  url: 'http://rest-mock.test',
  name: 'Project checklist',
  description: '',
  checklists_count: 2,
};

const initialExpectAnswers = {
  '554b3673d2f944299057143fa62be3ef': false,
  '4472d7df987644f39804cb7dbdbc2e6e': true,
};

const updatedExpectAnswers = {
  '554b3673d2f944299057143fa62be3ef': true,
  '4472d7df987644f39804cb7dbdbc2e6e': true,
};

jest.mock('./api', () => ({
  getChecklists: jest.fn(() => Promise.resolve(checklist)),
  getQuestions: jest.fn(() => Promise.resolve(questions)),
  getAnswers: jest.fn(() => Promise.resolve(answers)),
  getCategory: jest.fn(() => Promise.resolve(category)),
  getStats: jest.fn(() => Promise.resolve()),
  postAnswers: jest.fn(() => Promise.resolve()),
}));

const mockStore = configureStore();
const store = {
  workspace: {
    user: {
      uuid: 'uuid',
    },
  },
};

const renderUserChecklist = () =>
  mount(
    <Provider store={mockStore(store)}>
      <UserChecklist />
    </Provider>,
  );

const updateComponent = async (component) => {
  return await act(() => {
    component.update();
    return Promise.resolve();
  });
};

const initComponent = async () => {
  let component;

  await act(() => {
    component = renderUserChecklist();
    return Promise.resolve();
  });

  expect(component.find(LoadingSpinner)).toBeTruthy();

  await updateComponent(component);

  return Promise.resolve(component);
};

const expectPieChart = (component, { positive, negative, unknown }) => {
  const pieChart = component.find(PieChart);

  expect(pieChart.prop('positive')).toBe(positive);
  expect(pieChart.prop('negative')).toBe(negative);
  expect(pieChart.prop('unknown')).toBe(unknown);
};

const expectPropsQuestionsAndAnswers = (component, wrapper) => {
  const found = component.find(wrapper);

  expect(found).toBeTruthy();
  expect(found.prop('questions')).toEqual(questions);
  expect(found.prop('answers')).toEqual(initialExpectAnswers);
};

describe('UserChecklist', () => {
  it('initial component', async () => {
    const component = await initComponent();

    expectPropsQuestionsAndAnswers(component, AnswersTable);
    expectPropsQuestionsAndAnswers(component, AnswersSummary);

    expectPieChart(component, { positive: 1, negative: 1, unknown: 0 });
  });

  it('should change active answer for button in component AnswersTable after click', async () => {
    const component = await initComponent();

    const btnAnswer = component.find("input[type='radio']");

    btnAnswer.at(0).simulate('change');

    await updateComponent(component);

    const answersTable = component.find(AnswersTable);

    expect(answersTable.prop('answers')).toEqual(updatedExpectAnswers);
  });

  it('should change component PieChart after submit', async () => {
    const component = await initComponent();

    const btnAnswer = component.find("input[type='radio']");

    btnAnswer.at(0).simulate('change');

    await updateComponent(component);

    const answersTable = component.find(AnswersTable);

    expect(answersTable.prop('answers')).toEqual(updatedExpectAnswers);

    const btnSubmit = component.find('button');

    btnSubmit.simulate('click');

    await updateComponent(component);
    await updateComponent(component);

    expectPieChart(component, { positive: 2, negative: 0, unknown: 0 });
  });
});
