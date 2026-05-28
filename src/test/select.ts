import { screen, within, MatcherFunction } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Helpers for interacting with react-select / react-select-async-paginate
 * components in tests rendered via FormGroup (which wraps each field in a
 * `.position-relative` container with a `<label>`).
 */

/**
 * Locate the FormGroup container that wraps a react-select by its label text.
 * Works with both the standard `@/form/FormGroup` and the marketplace
 * `FormGroup` by walking up the DOM until an ancestor containing a
 * `.metronic-select-container` is found.
 */
export const getSelectByLabel = (labelText: string | RegExp): HTMLElement => {
  const labels = screen.getAllByText(labelText);
  for (const label of labels) {
    let node: HTMLElement | null = label.parentElement;
    while (node) {
      if (node.querySelector('.metronic-select-container')) {
        return node;
      }
      node = node.parentElement;
    }
  }
  throw new Error(
    `Could not find a react-select container for label "${labelText}"`,
  );
};

/**
 * Open a react-select dropdown within a specific container and pick an option.
 */
export const openAndSelectOptionInContainer = async (
  user: ReturnType<typeof userEvent.setup>,
  container: Element,
  optionText: string | RegExp | MatcherFunction,
) => {
  const combobox = within(container as HTMLElement).getByRole('combobox');
  await user.click(combobox);
  const option = await screen.findByText(optionText);
  await user.click(option);
};

/**
 * Open a react-select dropdown and pick an existing option by its visible text.
 */
export const openAndSelectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp,
  optionText: string | RegExp | MatcherFunction,
) => {
  const container = getSelectByLabel(labelText);
  await openAndSelectOptionInContainer(user, container, optionText);
};

/**
 * Type a search query into a react-select, then pick an option from the
 * filtered results. Useful for async selects that load options on search.
 */
export const typeAndSelectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string | RegExp,
  searchText: string,
  optionText: string | RegExp | MatcherFunction,
) => {
  const container = getSelectByLabel(labelText);
  const combobox = within(container).getByRole('combobox');
  await user.click(combobox);
  await user.type(combobox, searchText);
  const option = await screen.findByText(optionText);
  await user.click(option);
};

/**
 * Type into a creatable react-select and pick the newly created option.
 */
export const typeAndCreateOption = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string,
  text: string,
) => {
  const container = getSelectByLabel(labelText);
  const combobox = within(container).getByRole('combobox');
  await user.click(combobox);
  await user.type(combobox, text);
  const option = await screen.findByRole('option', { name: text });
  await user.click(option);
};

/**
 * Clear the current value of a react-select by clicking its clear indicator.
 * Returns `true` if the clear button was found and clicked, `false` otherwise.
 */
export const clearSelect = async (
  user: ReturnType<typeof userEvent.setup>,
  labelText: string,
) => {
  const container = getSelectByLabel(labelText);
  const clearButton = container.querySelector(
    '.metronic-select__clear-indicator',
  );
  if (clearButton) {
    await user.click(clearButton);
    return true;
  }
  return false;
};
