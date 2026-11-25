import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { K8sEgressRule } from './k8sEgressRules';
import { K8sEgressRulesSection } from './K8sEgressRulesSection';

const baseline: K8sEgressRule = {
  name: 'DNS',
  destination_type: 'cidr',
  destination: '10.0.0.53/32',
  protocol: 'UDP',
  port_range_min: 53,
  port_range_max: 53,
};
const rule: K8sEgressRule = {
  uuid: 'storage',
  name: 'Storage',
  destination_type: 'cidr',
  destination: '10.20.0.0/16',
};

const renderSection = (props = {}) => {
  const onChange = vi.fn();
  render(
    <K8sEgressRulesSection
      policy={{ egress_rules_enabled: true }}
      rules={[]}
      onChange={onChange}
      {...props}
    />,
  );
  return onChange;
};

describe('K8sEgressRulesSection', () => {
  it('explains that no rules leave outbound traffic open', () => {
    renderSection();
    expect(screen.getByTestId('k8s-egress-semantics')).toHaveTextContent(
      /unrestricted/,
    );
  });

  it('lists the baseline destinations read-only', () => {
    renderSection({
      policy: { egress_rules_enabled: true, egress_baseline_rules: [baseline] },
    });
    const list = screen.getByTestId('k8s-egress-baseline');
    expect(within(list).getByText('10.0.0.53/32')).toBeInTheDocument();
    expect(within(list).queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('adds an empty network rule', async () => {
    const onChange = renderSection();
    await userEvent.click(screen.getByText('Add egress rule'));
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ destination_type: 'cidr', destination: '' }),
    ]);
  });

  it('offers domains only when the offering allows them', () => {
    renderSection({ rules: [rule] });
    expect(
      screen.queryByRole('option', { name: 'Domain' }),
    ).not.toBeInTheDocument();
  });

  it('offers domains when allowed', () => {
    renderSection({
      rules: [rule],
      policy: { egress_rules_enabled: true, egress_domain_rules_allowed: true },
    });
    expect(screen.getByRole('option', { name: 'Domain' })).toBeInTheDocument();
  });

  it('commits typed ports on blur', async () => {
    const onChange = renderSection({ rules: [rule] });
    await userEvent.type(
      screen.getByLabelText('Ports of egress rule 1'),
      '8000-8100',
    );
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ port_range_min: 8000, port_range_max: 8100 }),
    ]);
  });

  it('puts invalid port text back instead of keeping it unsent', async () => {
    const onChange = renderSection({
      rules: [{ ...rule, protocol: 'TCP', port_range_min: 443 }],
    });
    const ports = screen.getByLabelText('Ports of egress rule 1');
    await userEvent.clear(ports);
    await userEvent.type(ports, '80-');
    await userEvent.tab();
    expect(ports).toHaveValue('443');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a rule', async () => {
    const onChange = renderSection({ rules: [rule] });
    await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
