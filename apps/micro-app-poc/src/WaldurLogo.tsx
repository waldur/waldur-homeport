/**
 * The Waldur wordmark for the sidebar's brand row — the mark's own path
 * copied verbatim from waldur-homeport's src/images/logo_w.svg (the white
 * variant it serves on dark asides), redrawn as a component rather than
 * imported so this standalone app doesn't reach into the root app's
 * src/images/.
 *
 * A real deployment's sidebar logo is tenant-configurable
 * (ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO, which BrandName.tsx resolves to
 * an uploaded image and falls back to SHORT_PAGE_TITLE text). This app
 * doesn't read runtime config at all yet — see its README — so it renders
 * the product's own mark, which is what the mockup shows; wiring the
 * tenant's uploaded logo in is follow-up work, not a placeholder to
 * replace.
 *
 * Both parts inherit currentColor from SidebarBrand's --nav-item-text, so
 * the wordmark tracks whatever SIDEBAR_STYLE is configured instead of
 * hardcoding white.
 */
export const WaldurLogo = () => (
  <span className="flex items-center gap-2 text-2xl leading-none font-bold tracking-wide">
    <svg
      viewBox="0 10 10 10.02"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m 2,10.04 v 7.98 h 1.98 v 2 H 0 v -9.98 z m 7.96,0 v 9.98 H 5.98 v -2 h 1.98 v -7.98 z m -3.98,3.98 v 4 h -2 v -4 z" />
    </svg>
    WALDUR
  </span>
);
