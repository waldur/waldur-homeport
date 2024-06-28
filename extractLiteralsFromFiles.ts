import * as fs from 'fs';
import * as path from 'path';

import * as ts from 'typescript';

// Function to extract string literals from binary expressions
function extractStringFromBinaryExpression(
  node: ts.BinaryExpression,
): string | null {
  const left = node.left;
  const right = node.right;

  let leftString: string | null = null;
  let rightString: string | null = null;

  if (ts.isStringLiteral(left)) {
    leftString = left.text;
  } else if (ts.isBinaryExpression(left)) {
    leftString = extractStringFromBinaryExpression(left);
  }

  if (ts.isStringLiteral(right)) {
    rightString = right.text;
  } else if (ts.isBinaryExpression(right)) {
    rightString = extractStringFromBinaryExpression(right);
  }

  if (leftString !== null && rightString !== null) {
    return leftString + rightString;
  } else if (leftString !== null) {
    return leftString;
  } else if (rightString !== null) {
    return rightString;
  }

  return null;
}

// Function to extract string literals from the first argument of the translate function
function extractStringLiteralFromTranslate(
  node: ts.Node,
  literals: Set<string>,
) {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'translate' &&
    node.arguments.length > 0
  ) {
    const firstArg = node.arguments[0];

    let literal: string | null = null;
    if (ts.isStringLiteral(firstArg)) {
      literal = firstArg.text;
    } else if (ts.isBinaryExpression(firstArg)) {
      literal = extractStringFromBinaryExpression(firstArg);
    }

    if (literal !== null) {
      literals.add(literal);
    }
  }

  ts.forEachChild(node, (childNode) =>
    extractStringLiteralFromTranslate(childNode, literals),
  );
}

// Function to process a single file
function processFile(filePath: string, literals: Set<string>) {
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );
  extractStringLiteralFromTranslate(sourceFile, literals);
}

// Function to recursively find all .ts and .tsx files in the specified directory
function getAllTSFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllTSFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Main function
function main(dirPath: string, outputFilePath: string) {
  const tsFiles = getAllTSFiles(dirPath);
  const literals = new Set<string>();

  tsFiles.forEach((filePath) => {
    processFile(filePath, literals);
  });

  // Convert the Set to an object with empty string values and sort its keys
  const sortedLiterals = Object.fromEntries(
    Array.from(literals)
      .sort()
      .map((literal) => [literal, '']),
  );

  // Save the extracted literals to a JSON file
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(sortedLiterals, null, 2),
    'utf8',
  );
}

// Specify the directory to be processed (e.g., current directory)
const directoryPath = path.join(__dirname, 'src');

// Specify the output JSON file path
const outputFilePath = path.join(__dirname, 'template.json');

// Run the main function
main(directoryPath, outputFilePath);