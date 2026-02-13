import { loader } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// Configure Monaco worker environment for Vite bundling.
// Without this, Monaco fails with "Cannot read properties of undefined (reading 'toUrl')"
// when trying to load language workers.
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

// Use local Monaco instead of CDN
loader.config({ monaco: monacoEditor });

let initPromise: Promise<typeof monacoEditor> | null = null;

export function initMonaco(): Promise<typeof monacoEditor> {
  if (!initPromise) {
    initPromise = loader.init() as Promise<typeof monacoEditor>;
  }
  return initPromise;
}
