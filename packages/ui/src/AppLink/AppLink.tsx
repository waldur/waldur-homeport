import {
  AriaAttributes,
  cloneElement,
  createContext,
  FC,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';

/**
 * Builds the app's router link for a destination: `to` is whatever its router
 * navigates by (a UI-Router state name, a React Router path, ...), with
 * `params` if it takes any. Return the link empty and without an `onClick`:
 * the component that asked for it fills in the content and classes.
 */
export type LinkRenderer = (to: string, params?: object) => ReactElement;

const LinkRendererContext = createContext<LinkRenderer | undefined>(undefined);

/**
 * Tells every waldur-ui component that takes a destination (`StatCard`'s
 * `link`, `BreadcrumbTrail`'s crumbs) how to draw a link with the app's
 * router. Without one, `to` is used as a plain href.
 */
export const LinkProvider: FC<
  PropsWithChildren<{ renderLink: LinkRenderer }>
> = ({ renderLink, children }) => (
  <LinkRendererContext.Provider value={renderLink}>
    {children}
  </LinkRendererContext.Provider>
);

/** The nearest `LinkProvider`'s renderer, if any. */
export const useLinkRenderer = () => useContext(LinkRendererContext);

export interface AppLinkProps extends Pick<
  AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby'
> {
  to: string;
  params?: object;
  className?: string;
  id?: string;
  children: ReactNode;
}

/**
 * A link to `to`, drawn by the nearest `LinkProvider`'s renderer and filled
 * with `children`, or a plain `<a href>` without one.
 */
export const AppLink: FC<AppLinkProps> = ({
  to,
  params,
  children,
  ...props
}) => {
  const renderLink = useLinkRenderer();
  if (!renderLink) {
    return (
      <a href={to} {...props}>
        {children}
      </a>
    );
  }
  return cloneElement(
    renderLink(to, params) as ReactElement<Record<string, unknown>>,
    props,
    children,
  );
};
