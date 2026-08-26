// Stub replacing @codesandbox/nodebox, which is published under the
// Sustainable Use License: use is limited to "internal business purposes or
// non-commercial or personal use", and redistribution to "free of charge for
// non-commercial purposes". Homeport is MIT and redistributed commercially, so
// the licence is a deny under the policy in waldur/waldur-pipelines
// (templates/test/license-scan.yml).
//
// Nothing here uses it. It arrives transitively --
//
//   @mdxeditor/editor -> @codesandbox/sandpack-react
//                     -> @codesandbox/sandpack-client -> @codesandbox/nodebox
//
// -- behind MDXEditor's Sandpack plugin. MarkdownEditor.tsx builds its toolbar
// from codeBlockPlugin/codeMirrorPlugin and never calls sandpackPlugin, and
// @mdxeditor/editor declares `sideEffects: ["*.css"]`, so the bundler already
// drops the whole Sandpack branch: no nodebox or sandpack-react module appears
// in any built chunk or sourcemap, and the image ships dist/ only. Stubbing it
// keeps the licence out of yarn.lock and the SBOM as well, and stops it
// re-entering the tree unnoticed.
//
// Only the three runtime bindings @codesandbox/sandpack-client imports are
// declared; its remaining reference (@codesandbox/nodebox/build/modules/shell)
// is type-only. Enabling sandpackPlugin will fail loudly here rather than
// silently pulling the real package back in.

const STUB_MESSAGE =
  '@codesandbox/nodebox is stubbed out in waldur-homeport (Sustainable Use ' +
  'License). The MDXEditor Sandpack plugin is therefore unavailable. See ' +
  'stubs/nodebox/index.js.';

export const INJECT_MESSAGE_TYPE = 'nodebox-stub/inject';
export const PREVIEW_LOADED_MESSAGE_TYPE = 'nodebox-stub/preview-loaded';

export class Nodebox {
  constructor() {
    throw new Error(STUB_MESSAGE);
  }
}

export default { Nodebox, INJECT_MESSAGE_TYPE, PREVIEW_LOADED_MESSAGE_TYPE };
