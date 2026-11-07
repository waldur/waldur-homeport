// The tabs preload the pages behind them, which import the tabs: so the tabs
// reach the preloader through here, where pages.ts registers it, rather than
// importing pages.ts and closing the loop.
let preloadPages: (() => unknown) | undefined;

export const registerTabPagesPreload = (preload: () => unknown) => {
  preloadPages = preload;
};

export const preloadTabPages = () => preloadPages?.();
