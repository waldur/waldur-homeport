import { Plugin } from 'vite';
import { SourceMapGenerator } from 'source-map';

export default function reactDisplayNamePlugin(): Plugin {
  return {
    name: 'vite-plugin-react-displayname',
    transform(code: string, id: string) {
      // Check if file should be processed
      if (!id.endsWith('.tsx') || id.includes('node_modules')) {
        return null;
      }

      const map = new SourceMapGenerator({
        file: id,
        sourceRoot: '',
        skipValidation: true,
      });

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
      while ((match = componentRegex.exec(code)) !== null) {
        if (isInsideComment(match.index)) continue;
        const componentName = match[1];
        // Add displayName at the end of the file
        transformedCode = `${transformedCode}\n${componentName}.displayName = '${componentName}';`;
      }

      return {
        code: transformedCode,
        map: map.toString(),
      };
    },
  };
}
