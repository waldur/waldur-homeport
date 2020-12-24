import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { actWait, updateWrapper } from '@waldur/core/testUtils';
import { Await } from '@waldur/core/types';
import { SET_TITLE } from '@waldur/navigation/title';

jest.mock('./api');

import { AnswersSummary } from './AnswersSummary';
import { AnswersTable } from './AnswersTable';
import * as api from './api';
import * as fixtures from './fixtures';
import { PieChart } from './PieChart';
import { UserChecklist } from './UserChecklist';

const apiMock = api as jest.Mocked<typeof api>;

jest.mock('@waldur/configs/default', () => ({
  ENV: 'localhost',
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

const initialExpectAnswers = {
  '554b3673d2f944299057143fa62be3ef': false,
  '4472d7df987644f39804cb7dbdbc2e6e': true,
};

const updatedExpectAnswers = {
  '554b3673d2f944299057143fa62be3ef': true,
  '4472d7df987644f39804cb7dbdbc2e6e': true,
};

const initialPieChartProps = { positive: 1, negative: 1, unknown: 0 };

const renderChecklist = async (
  store,
  extraProps: React.ComponentProps<typeof UserChecklist> = {},
) => {
  const wrapper = mount<typeof UserChecklist>(
    <Provider store={store}>
      <UserChecklist {...extraProps} />
    </Provider>,
  );
  await actWait();

  expect(wrapper.find(LoadingSpinner)).toBeTruthy();

  await updateWrapper(wrapper);

  return wrapper;
};

type ChecklistWrapper = Await<ReturnType<typeof renderChecklist>>;

const expectPieChart = (
  wrapper: ChecklistWrapper,
  { positive, negative, unknown },
) => {
  const pieChart = wrapper.find(PieChart);

  expect(pieChart.prop('positive')).toBe(positive);
  expect(pieChart.prop('negative')).toBe(negative);
  expect(pieChart.prop('unknown')).toBe(unknown);
};

const changeAnswer = async (wrapper: ChecklistWrapper) => {
  const btnAnswer = wrapper.find("input[type='radio']");
  btnAnswer.at(0).simulate('change');
  await updateWrapper(wrapper);
};

const submit = async (wrapper: ChecklistWrapper) => {
  wrapper.find('button').simulate('click');
  await updateWrapper(wrapper);
  await updateWrapper(wrapper);
};

describe('UserChecklist', () => {
  let store;

  beforeEach(() => {
    apiMock.getChecklists.mockResolvedValue(fixtures.checklists);
    apiMock.getQuestions.mockResolvedValue(fixtures.questions);
    apiMock.getAnswers.mockResolvedValue(fixtures.answers);
    apiMock.getCategory.mockResolvedValue(fixtures.category);
    apiMock.getStats.mockResolvedValue([]);
    apiMock.postAnswers.mockResolvedValue(null);

    const mockStore = configureStore();
    const storeData = {
      workspace: {
        user: {
          uuid: 'current-user-uuid',
        },
      },
    };

    store = mockStore(storeData);
  });

  it('renders empty message if there are no checklist in given category yet', async () => {
    apiMock.getChecklists.mockResolvedValue([]);
    const wrapper = await renderChecklist(store);
    expect(wrapper.html()).toBe('There are no checklist yet.');
  });

  it('renders error message if it is unable to load checklists', async () => {
    apiMock.getChecklists.mockRejectedValue(null);
    const wrapper = await renderChecklist(store);
    expect(wrapper.html()).toBe('Unable to load checklists.');
  });

  it('renders error message if it is unable to load questions', async () => {
    apiMock.getQuestions.mockRejectedValue(null);
    const wrapper = await renderChecklist(store);
    expect(wrapper.html()).toContain('Unable to load questions and answers.');
  });

  it('renders error message if it is unable to load questions', async () => {
    apiMock.getAnswers.mockRejectedValue(null);
    const wrapper = await renderChecklist(store);
    expect(wrapper.html()).toContain('Unable to load questions and answers.');
  });

  it('renders error message if it is unable to load category', async () => {
    apiMock.getCategory.mockRejectedValue(null);
    const wrapper = await renderChecklist(store);
    expect(wrapper.html()).toContain('Unable to load questions and answers.');
  });

  it('renders error notification if it is unable to load questions', async () => {
    // Arrange
    apiMock.getAnswers.mockRejectedValue(null);

    // Act
    await renderChecklist(store);

    // Assert
    const actions = store.getActions();
    expect(actions[0].payload.status).toBe('error');
  });

  it('renders answers table', async () => {
    const wrapper = await renderChecklist(store);

    const node = wrapper.find(AnswersTable);
    expect(node.prop('questions')).toEqual(fixtures.questions);
    expect(node.prop('answers')).toEqual(initialExpectAnswers);
  });

  it('renders answers summary', async () => {
    const wrapper = await renderChecklist(store);

    const node = wrapper.find(AnswersSummary);
    expect(node.prop('questions')).toEqual(fixtures.questions);
    expect(node.prop('answers')).toEqual(initialExpectAnswers);
  });

  it('renders pie chart', async () => {
    const wrapper = await renderChecklist(store);
    expectPieChart(wrapper, initialPieChartProps);
  });

  it('sets document title from category name', async () => {
    await renderChecklist(store);

    const actions = store.getActions();
    expect(actions[0].type).toBe(SET_TITLE);
  });

  it('fetches questions for current checklist', async () => {
    await renderChecklist(store);
    expect(apiMock.getQuestions).toBeCalledWith(fixtures.checklists[0].uuid);
  });

  it('fetches category by state param', async () => {
    await renderChecklist(store);
    expect(apiMock.getCategory).toBeCalledWith('mock-category');
  });

  it('fetches answers for current user and current checklist', async () => {
    await renderChecklist(store);
    expect(apiMock.getAnswers).toBeCalledWith(
      'current-user-uuid',
      fixtures.checklists[0].uuid,
    );
  });

  it('updates summary when answer is changed', async () => {
    // Arrange
    const wrapper = await renderChecklist(store);

    // Act
    await changeAnswer(wrapper);

    // Assert
    const answersTable = wrapper.find(AnswersTable);
    expect(answersTable.prop('answers')).toEqual(updatedExpectAnswers);
  });

  it('sends API request when answers are submitted', async () => {
    const wrapper = await renderChecklist(store);
    await submit(wrapper);
    expect(apiMock.postAnswers).toBeCalled();
  });

  it('updates pie chart after submit', async () => {
    // Arrange
    const wrapper = await renderChecklist(store);

    // Act
    await changeAnswer(wrapper);
    await submit(wrapper);

    // Assert
    expectPieChart(wrapper, { positive: 2, negative: 0, unknown: 0 });
  });

  it('renders success notification after submit', async () => {
    // Arrange
    const wrapper = await renderChecklist(store);

    // Act
    await changeAnswer(wrapper);
    await submit(wrapper);

    // Assert
    const actions = store.getActions();
    expect(actions[1].payload.status).toBe('success');
  });

  it('does not update pie chart if submit failed', async () => {
    // Arrange
    apiMock.postAnswers.mockRejectedValue(null);
    const wrapper = await renderChecklist(store);

    // Act
    await changeAnswer(wrapper);
    await submit(wrapper);

    // Assert
    expectPieChart(wrapper, initialPieChartProps);
  });

  it('renders error notification if submit failed', async () => {
    // Arrange
    apiMock.postAnswers.mockRejectedValue(null);
    const wrapper = await renderChecklist(store);

    // Act
    await changeAnswer(wrapper);
    await submit(wrapper);

    // Assert
    const actions = store.getActions();
    expect(actions[1].payload.status).toBe('error');
  });

  it('conceals submit button if checklist is read-only', async () => {
    const wrapper = await renderChecklist(store, { readOnly: true });
    expect(wrapper.contains('button')).toBe(false);
  });

  it('conceals input elements if checklist is read-only', async () => {
    const wrapper = await renderChecklist(store, { readOnly: true });
    expect(wrapper.contains(`input[type='radio']`)).toBe(false);
  });
});
