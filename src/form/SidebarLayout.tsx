import { FC, PropsWithChildren } from 'react';

import { cn, StepperLayout } from 'waldur-ui';

import { useFullPage } from '@/navigation/context';
import {
  PAGE_CONTAINER_CLASSNAME,
  PAGE_CONTAINER_XXL_CLASSNAME,
} from '@/navigation/pageContainer';

/**
 * waldur-ui's StepperLayout in the portal's page frame. Its sticky column
 * sits below the portal's sticky chrome through `--layout-sticky-top`,
 * which Layout measures (navigation/chromeHeights.ts).
 */

/** `fluid`: the full width of the page, as a list page has it, not capped. */
const frame = (fluid?: boolean) =>
  fluid ? PAGE_CONTAINER_CLASSNAME : PAGE_CONTAINER_XXL_CLASSNAME;

const Container: FC<PropsWithChildren<{ fluid?: boolean }>> = (props) => (
  <StepperLayout.Container className={frame(props.fluid)}>
    {props.children}
  </StepperLayout.Container>
);

const Header: FC<PropsWithChildren<{ className?: string; fluid?: boolean }>> = (
  props,
) => (
  <StepperLayout.Header className={cn(frame(props.fluid), props.className)}>
    {props.children}
  </StepperLayout.Header>
);

const Body = StepperLayout.Body;

// Below page tabs the column sits 10px lower and is as tall as its content.
const Sidebar: FC<PropsWithChildren> = (props) => {
  useFullPage();
  return (
    <StepperLayout.Aside className="in-[[data-page-tabs]]:top-[calc(var(--layout-sticky-top)+20px)] in-[[data-page-tabs]]:h-fit">
      {props.children}
    </StepperLayout.Aside>
  );
};

export const SidebarLayout = { Container, Header, Body, Sidebar };
