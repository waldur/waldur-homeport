import { Plugin } from 'vite';

export default function reactDisplayNamePlugin(): Plugin {
  return {
    name: 'vite-plugin-react-displayname',
    transform(code: string, id: string) {
      // Check if file should be processed
      if (!id.endsWith('.tsx') || id.includes('node_modules')) {
        return null;
      }

      // Only process the file if it doesn't already contain displayName assignments
      if (code.includes('.displayName =')) {
        return null;
      }

      let transformedCode = code;
      // This regex matches React component declarations with the following parts:
      const componentRegex =
        /export\s+const\s+([A-Z][A-Za-z0-9]*)\s*(?::\s*[^=]+)?\s*=\s*(?:\([^)]*\)|function)/g;
      /*
        export\s+                    // Matches 'export' keyword followed by whitespace
        const\s+                     // Matches 'const' keyword followed by whitespace
        ([A-Z][A-Za-z0-9]*)         // Captures component name: must start with capital letter
                                    // followed by any letters or numbers
        \s*                         // Optional whitespace
        (?::\s*[^=]+)?             // Optional type annotation (e.g., ': FunctionComponent')
        \s*=\s*                     // Equals sign with optional whitespace around it
        (?:                         // Non-capturing group for the function definition
          \([^)]*\)                 // Arrow function parameters in parentheses
          |                         // OR
          function                  // Function keyword
        )
      */

      // Find all comment ranges to skip matches inside comments
      const commentRanges: Array<[number, number]> = [];
      const commentRegex = /\/\/.*$|\/\*[\s\S]*?\*\//gm;
      let commentMatch;
      while ((commentMatch = commentRegex.exec(code)) !== null) {
        commentRanges.push([
          commentMatch.index,
          commentMatch.index + commentMatch[0].length,
        ]);
      }

      const isInsideComment = (pos: number) =>
        commentRanges.some(([start, end]) => pos >= start && pos < end);

      let match;
      let appended = false;
      while ((match = componentRegex.exec(code)) !== null) {
        if (isInsideComment(match.index)) continue;
        const componentName = match[1];
        // Add displayName at the end of the file
        transformedCode = `${transformedCode}\n${componentName}.displayName = '${componentName}';`;
        appended = true;
      }

      if (!appended) return null;

      // Returning `map: null` (instead of an empty SourceMapGenerator
      // serialization) tells Vite to PRESERVE the upstream map from
      // @vitejs/plugin-react instead of clobbering the chain with a
      // mappings-empty sentinel. That sentinel collapsed Sentry stack
      // traces to the post-JSX-transform code with no original-TSX
      // context — verified by reading vite's combineSourcemaps short-
      // circuit at chunks/node.js:~21263 (the `mappings === ""` break).
      // Since we only append lines at end-of-file and don't touch
      // existing offsets, the upstream map remains valid for every
      // original line.
      return { code: transformedCode, map: null };
    },
  };
}
