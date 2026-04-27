import { render, screen } from '@testing-library/react';
import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
} from '@uirouter/react';
import { describe, expect, it } from 'vitest';

import { TermsOfService } from '@/user/support/TermsOfService';

const renderComponent = (props?) => {
  const router = new UIRouterReact();
  router.plugin(servicesPlugin);
  router.plugin(pushStateLocationPlugin);

  render(
    <UIRouter router={router}>
      <TermsOfService agreementDate="2018-01-23T10:49:36.162934Z" {...props} />
    </UIRouter>,
  );
};

describe('TermsOfService', () => {
  it('should render default text and agreement date if form is not initial', () => {
    renderComponent();
    expect(screen.getByText(/have been accepted on/)).toBeInTheDocument();
  });

  it('should render appropriate text if form is initial', () => {
    renderComponent({ initial: true });
    expect(
      screen.getByText(/By submitting the form you are agreeing to the /),
    ).toBeInTheDocument();
  });
});
