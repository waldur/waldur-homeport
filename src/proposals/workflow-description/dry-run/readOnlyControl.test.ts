import { describe, expect, it, vi } from 'vitest';

import { isReadOnlyControl, jumpWithinPreview } from './DryRunPreview';

const html = (markup: string) => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  document.body.appendChild(root);
  return root;
};

describe('what a preview lets a click reach', () => {
  it('lets a card be opened and folded, from its title too', () => {
    const root = html(
      '<button aria-expanded="false" aria-controls="c1"><span id="t">Evaluators</span></button>',
    );
    expect(isReadOnlyControl(root.querySelector('#t'))).toBe(true);
  });

  it('stops an action, even one in a card header', () => {
    const root = html(
      '<div aria-expanded="false" aria-controls="c1"><button id="b">Assign</button></div>',
    );
    expect(isReadOnlyControl(root.querySelector('#b'))).toBe(false);
  });

  it('stops links and fields', () => {
    const root = html('<a id="a" href="/x">x</a><input id="i" />');
    ['#a', '#i'].forEach((id) =>
      expect(isReadOnlyControl(root.querySelector(id))).toBe(false),
    );
  });

  it('lets a tab be chosen, but not a tab that navigates', () => {
    const root = html(
      '<button role="tab" id="tab-button">Workflow</button><a role="tab" id="tab-link" href="/y">Y</a>',
    );
    expect(isReadOnlyControl(root.querySelector('#tab-button'))).toBe(true);
    expect(isReadOnlyControl(root.querySelector('#tab-link'))).toBe(false);
  });

  it('lets a row that expands be opened, inside a dialog too', () => {
    const root = html(
      '<div role="dialog" tabindex="-1"><table><tbody>' +
        '<tr><td><span data-testid="row-expander"></span><div id="c">Event</div></td><td><button id="b">Act</button></td></tr>' +
        '<tr><td id="plain">Not expandable</td></tr>' +
        '</tbody></table></div>',
    );
    expect(isReadOnlyControl(root.querySelector('#c'))).toBe(true);
    expect(isReadOnlyControl(root.querySelector('#b'))).toBe(false);
    expect(isReadOnlyControl(root.querySelector('#plain'))).toBe(false);
  });
});

describe('a link to a section of the previewed page', () => {
  it('opens the section within the preview', () => {
    const root = html(
      '<a id="rail" href="/p/#step-activity">Activity</a>' +
        '<div id="step-activity"><button aria-expanded="false" aria-controls="x">Activity</button></div>',
    );
    const toggle = root.querySelector('#step-activity button') as HTMLElement;
    const clicked = vi.fn();
    toggle.addEventListener('click', clicked);
    expect(jumpWithinPreview(root.querySelector('#rail'), root)).toBe(true);
    expect(clicked).toHaveBeenCalled();
  });

  it('leaves a link to anywhere else alone', () => {
    const root = html('<a id="out" href="/p/#elsewhere">Out</a>');
    expect(jumpWithinPreview(root.querySelector('#out'), root)).toBe(false);
  });
});
