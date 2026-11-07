import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkflowDescription } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { ThemeContext, ThemeName } from '@/theme/types';

import { DESCRIPTION } from '../description.fixture';

import { diagramPalette } from './palette';
import { ProposalStepsChart } from './ProposalStepsGantt';
import { SwimlaneDiagram } from './SwimlaneDiagram';
import { WorkflowGantt } from './WorkflowGantt';

// jsdom loads no stylesheet: resolve a token from the token CSS, in the
// theme applied to <html>, as the browser would.
vi.mock('waldur-design-tokens', async (importOriginal) => {
  const { resolveToken } =
    await import('waldur-design-tokens/test-support/theme-tokens');
  return {
    ...(await importOriginal<typeof import('waldur-design-tokens')>()),
    getCssVar: (name: string) =>
      resolveToken(
        name,
        document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
      ),
  };
});

describe('SwimlaneDiagram', () => {
  it('opens the step dialog from a box, and on the page of what was clicked', async () => {
    const user = userEvent.setup();
    const onOpenStep = vi.fn();
    renderWithProviders(
      <SwimlaneDiagram description={DESCRIPTION} onOpenStep={onOpenStep} />,
    );
    const box = screen.getByTestId('diagram-box-technical');
    await user.click(box);
    expect(onOpenStep).toHaveBeenLastCalledWith('technical', 'basics');
    await user.click(within(box).getByText('21 d'));
    expect(onOpenStep).toHaveBeenLastCalledWith('technical', 'timing');
    screen.getByTestId('diagram-box-report').focus();
    await user.keyboard('{Enter}');
    expect(onOpenStep).toHaveBeenLastCalledWith('report', 'basics');
  });

  it('draws a lane per completing actor and no buttons when read-only', () => {
    renderWithProviders(<SwimlaneDiagram description={DESCRIPTION} />);
    expect(screen.getByTestId('diagram-lane-panel_chair')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('diagram-edge-input')).toHaveLength(1);
  });

  it('badges a per-round step only when the description says so', () => {
    const { unmount } = renderWithProviders(
      <SwimlaneDiagram description={DESCRIPTION} />,
    );
    expect(screen.queryByTestId('diagram-round-badge')).not.toBeInTheDocument();
    unmount();
    const description = {
      ...DESCRIPTION,
      call: { ...DESCRIPTION.call, rounds: [{}, {}, {}] },
      steps: DESCRIPTION.steps.map((step) =>
        step.key === 'report'
          ? { ...step, extra: { round_scoped: true } }
          : step,
      ),
    } as unknown as WorkflowDescription;
    renderWithProviders(<SwimlaneDiagram description={description} />);
    const badge = screen.getByTestId('diagram-round-badge');
    expect(within(badge).getByText('×3')).toBeInTheDocument();
  });

  it('overlays progress with overdue counts', () => {
    renderWithProviders(
      <SwimlaneDiagram
        description={DESCRIPTION}
        progress={
          new Map([
            [
              'technical',
              { median_days: 30, planned_days: 21, waiting: 4, overdue: 2 },
            ],
          ])
        }
      />,
    );
    const box = screen.getByTestId('diagram-box-technical');
    expect(within(box).getByText(/Median 30 d of 21 d/)).toBeInTheDocument();
    expect(within(box).getByText(/2 overdue/)).toBeInTheDocument();
  });

  it('counts a per-round step by the rounds it was opened in', () => {
    renderWithProviders(
      <SwimlaneDiagram
        description={DESCRIPTION}
        progress={
          new Map([
            [
              'report',
              {
                median_days: null,
                planned_days: 7,
                waiting: 3,
                overdue: 0,
                round_scoped: true,
                rounds: [
                  { round: 'a', opened: true },
                  { round: 'b', opened: false },
                ] as any,
              },
            ],
          ])
        }
      />,
    );
    const box = screen.getByTestId('diagram-box-report');
    expect(
      within(box).getByText('Opened in 1 of 2 rounds'),
    ).toBeInTheDocument();
  });

  it('heads the columns after the award with their phase', () => {
    const report = DESCRIPTION.steps[2];
    renderWithProviders(
      <SwimlaneDiagram
        description={
          {
            ...DESCRIPTION,
            steps: [
              ...DESCRIPTION.steps,
              {
                ...report,
                key: 'final_report',
                order: 9,
                stage: 7,
                phase: 'closing',
                input_steps: [],
              },
            ],
          } as unknown as WorkflowDescription
        }
      />,
    );
    expect(screen.getByTestId('diagram-section-closing')).toBeInTheDocument();
    expect(screen.getByText('Closing · Stage 1')).toBeInTheDocument();
  });
});

describe('WorkflowGantt', () => {
  it('marks the bars ending after the decision', () => {
    renderWithProviders(
      <WorkflowGantt
        plan={{
          name: null,
          cutoff: null,
          openEnded: false,
          decisionDay: 10,
          decisionSource: 'target_decision_days',
          totalDays: 15,
          overrunDays: 5,
          rows: [
            {
              key: 'a',
              name: 'A',
              start: 0,
              end: 8,
              conditional: false,
              critical: true,
              roundScoped: false,
              noDuration: false,
              late: false,
            },
            {
              key: 'b',
              name: 'B',
              start: 8,
              end: 15,
              conditional: true,
              critical: true,
              roundScoped: true,
              noDuration: false,
              late: true,
            },
          ],
        }}
      />,
    );
    expect(screen.getByTestId('gantt-row-a').dataset.late).toBe('false');
    expect(screen.getByTestId('gantt-row-b').dataset.late).toBe('true');
    expect(screen.getByTestId('gantt-decision')).toBeInTheDocument();
  });
});

describe('ProposalStepsChart', () => {
  it('draws actual bars, red when overdue, and the mail sent', () => {
    renderWithProviders(
      <ProposalStepsChart
        timeline={{
          proposal_uuid: 'p',
          proposal_name: 'P',
          state: 'in_review',
          generated_at: '2027-01-20T00:00:00Z',
          steps: [
            {
              key: 'a',
              name: 'Eligibility',
              stage: 0,
              status: 'completed',
              outcome: 'eligible',
              planned_days: 5,
              started_at: '2027-01-01T00:00:00Z',
              completed_at: '2027-01-09T00:00:00Z',
              deadline: '2027-01-06T00:00:00Z',
              overdue: true,
              completed_by_name: 'Ada Lovelace',
              sent_notifications: [],
            },
            {
              key: 'b',
              name: 'Technical',
              stage: 1,
              status: 'skipped',
              outcome: null,
              planned_days: 10,
              started_at: null,
              completed_at: null,
              deadline: null,
              overdue: false,
              completed_by_name: null,
              sent_notifications: [],
            },
          ],
          notifications: [
            {
              created: '2027-01-09T00:00:01Z',
              step_key: 'a',
              step_name: 'Eligibility',
              template: 'workflow_step_event',
              trigger: 'step_completed',
              audience: 'applicant',
              recipient_count: 2,
              email_log_uuids: ['mail-1'],
            },
          ],
        }}
      />,
    );
    expect(screen.getByTestId('proposal-gantt-actual-a').dataset.overdue).toBe(
      'true',
    );
    expect(screen.getAllByText(/not needed/).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('proposal-gantt-mail')).toHaveLength(1);
  });
});

// applyTheme() sets <html>'s theme before the re-render; do the same.
const renderInTheme = (theme: ThemeName, ui: JSX.Element) => {
  document.documentElement.dataset.theme = theme;
  return renderWithProviders(
    <ThemeContext.Provider value={{ theme, toggleTheme: () => undefined }}>
      {ui}
    </ThemeContext.Provider>,
  );
};

const paletteIn = (theme: ThemeName) => {
  document.documentElement.dataset.theme = theme;
  return diagramPalette(theme);
};

// The colours are SVG internals no query reaches: the drawing's own
// <style>, a box's <rect>, the hatch pattern.
const drawingStyle = (testId: string) =>
  // eslint-disable-next-line testing-library/no-node-access
  screen.getByTestId(testId).querySelector('style')?.textContent ?? '';

describe('the drawings in the dark theme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it.each<ThemeName>(['light', 'dark'])(
    'reads every colour from a design token (%s)',
    (theme) => {
      // An unknown token throws in the resolver; a known one is a hex.
      const palette = paletteIn(theme);
      for (const value of Object.values(palette).flat()) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
      expect(palette.background).not.toBe(palette.text);
    },
  );

  it('draws the diagram on a dark canvas with light text', () => {
    renderInTheme(
      'dark',
      <SwimlaneDiagram
        description={DESCRIPTION}
        progress={
          new Map([
            [
              'technical',
              { median_days: 40, planned_days: 21, waiting: 1, overdue: 1 },
            ],
          ])
        }
      />,
    );
    const dark = paletteIn('dark');
    const style = drawingStyle('workflow-diagram');
    expect(style).toContain(`.wd-bg { fill: ${dark.background}; }`);
    expect(style).toContain(`.wd-name { fill: ${dark.text};`);
    expect(style).not.toContain('#ffffff');
    const box = screen
      .getByTestId('diagram-box-technical')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('rect') as SVGRectElement;
    // Far past its plan: the strongest step of the dark scale.
    expect(box.style.fill).toMatch(/#b54708|rgb\(181, 71, 8\)/);
  });

  it('keeps the light palette in the light theme', () => {
    renderInTheme('light', <SwimlaneDiagram description={DESCRIPTION} />);
    const light = paletteIn('light');
    expect(drawingStyle('workflow-diagram')).toContain(
      `.wd-bg { fill: ${light.background}; }`,
    );
  });

  it('draws the timelines on a dark canvas', () => {
    renderInTheme(
      'dark',
      <WorkflowGantt
        plan={{
          name: null,
          cutoff: null,
          openEnded: false,
          decisionDay: null,
          decisionSource: null,
          totalDays: 10,
          overrunDays: 0,
          rows: [],
        }}
      />,
    );
    const dark = paletteIn('dark');
    const gantt = drawingStyle('workflow-gantt');
    expect(gantt).toContain(`.wg-bg { fill: ${dark.background}; }`);
    expect(gantt).not.toContain('#ffffff');
    expect(
      screen
        .getByTestId('workflow-gantt')
        // eslint-disable-next-line testing-library/no-node-access
        .querySelector('pattern rect')
        ?.getAttribute('fill'),
    ).toBe(dark.background);
  });
});

describe('the decision label', () => {
  const plan = (decisionDay: number) => ({
    name: null,
    cutoff: null,
    openEnded: false,
    decisionDay,
    decisionSource: 'target_decision_days',
    totalDays: 120,
    overrunDays: 0,
    rows: [],
  });
  const viewBoxWidth = () =>
    Number(
      screen
        .getByTestId('workflow-gantt')
        .getAttribute('viewBox')
        ?.split(' ')[2],
    );

  it('ends at its line when it would run past the right edge', () => {
    renderWithProviders(<WorkflowGantt plan={plan(120)} />);
    const label = screen.getByTestId('gantt-decision-label');
    expect(label.getAttribute('text-anchor')).toBe('end');
    expect(Number(label.getAttribute('x'))).toBeLessThanOrEqual(viewBoxWidth());
  });

  it('stays right of its line while it fits', () => {
    renderWithProviders(<WorkflowGantt plan={plan(20)} />);
    const label = screen.getByTestId('gantt-decision-label');
    expect(label.getAttribute('text-anchor')).toBe('start');
    expect(
      Number(label.getAttribute('x')) + (label.textContent ?? '').length * 6.6,
    ).toBeLessThanOrEqual(viewBoxWidth());
  });
});
