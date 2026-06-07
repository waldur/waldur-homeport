import * as RAA from 'attr-accept';
import accepts from 'attr-accept';
import { describe, expect, test } from 'vitest';

// attr-accept v2 declared `module: dist/es/index.js` but the file was
// actually CJS (`exports.__esModule = true; exports.default = fn`). Under
// Vite 8 / Rolldown's stricter interop the default import resolved to a
// namespace object, not the function — `accepts(file, mime)` would throw
// "accepts is not a function" in FileUploadField and issue attachments.
// We bumped to v3 (proper ESM) + pinned via resolutions to push react-
// dropzone's transitive copy to the same version. This test guards the
// import shape so a future regression of the unwrap (or a downgrade to
// v2) breaks loudly at unit-test time instead of as a runtime error on
// every upload form. Mirrors react-flatpickr-shape.test.ts.
describe('attr-accept module shape', () => {
  test('default import is the callable function', () => {
    expect(typeof accepts).toBe('function');
  });

  test('namespace import has the function at .default', () => {
    expect(typeof (RAA as any).default).toBe('function');
  });

  test('the function accepts the documented signature', () => {
    expect(accepts({ name: 'photo.png', type: 'image/png' }, 'image/*')).toBe(
      true,
    );
    expect(
      accepts({ name: 'photo.png', type: 'image/png' }, 'application/pdf'),
    ).toBe(false);
  });
});
