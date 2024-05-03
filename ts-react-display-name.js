'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ts = require('typescript');
/**
 * Creates an assignment statement. We assign the name of the given node to the property displayName
 * of that node (node.displayName = node.name).
 */
const createSetDisplayNameStatement = (node, sf) => {
  const name = ts.getNameOfDeclaration(node).getText(sf);
  const displayNameProp = ts.factory.createPropertyAccessExpression(
    node.name,
    'displayName',
  );
  return ts.factory.createAssignment(
    displayNameProp,
    ts.factory.createStringLiteral(name),
  );
};
/**
 * Checks if a variable declaration is for a React.FunctionComponent/React.FC.
 */
const isFunctionComponent = (node, sf, options) => {
  if (node.type && ts.isTypeReferenceNode(node.type)) {
    const type = node.type.typeName.getText(sf);
    return options.funcTypes.some((funcType) => funcType === type);
  }
  return false;
};
/**
 * Checks if a variable declaration is for a React.forwardRef/React.memo.
 */
const isFactoryComponent = (node, sf, options) => {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const type = ts.getNameOfDeclaration(node.expression).getText(sf);
    return options.factoryFuncs.some((factoryType) => factoryType === type);
  }
  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    ts.isIdentifier(node.name)
  ) {
    const type =
      ts.getNameOfDeclaration(node.expression).getText(sf) +
      '.' +
      ts.getNameOfDeclaration(node.name).getText(sf);
    return options.factoryFuncs.some((factoryType) => factoryType === type);
  }
  if (
    ts.isCallExpression(node.expression) ||
    ts.isPropertyAccessExpression(node.expression)
  ) {
    return isFactoryComponent(node.expression, sf, options);
  }
  return false;
};
/**
 * Recursive function that visits the nodes of the file.
 */
function visit(ctx, sf, options) {
  const visitor = (node) => {
    if (ts.isVariableStatement(node)) {
      const components = [];
      ts.forEachChild(node, (child1) => {
        if (ts.isVariableDeclarationList(child1)) {
          ts.forEachChild(child1, (child2) => {
            if (ts.isVariableDeclaration(child2)) {
              if (isFunctionComponent(child2, sf, options)) {
                components.push(child2);
              } else {
                ts.forEachChild(child2, (child3) => {
                  if (
                    ts.isCallExpression(child3) ||
                    ts.isPropertyAccessExpression(child3)
                  ) {
                    if (isFactoryComponent(child3, sf, options)) {
                      components.push(child2);
                    }
                  }
                });
              }
            }
          });
        }
      });
      let result = node;
      if (!options.onlyFileRoot) {
        result = ts.visitEachChild(node, visitor, ctx);
      }
      if (components.length) {
        return [
          result,
          ...components.map((comp) => createSetDisplayNameStatement(comp, sf)),
        ];
      } else {
        return result;
      }
    }
    if (!options.onlyFileRoot || ts.isSourceFile(node)) {
      return ts.visitEachChild(node, visitor, ctx);
    } else {
      return node;
    }
  };
  return visitor;
}
/**
 * Factory method that creates a Transformer.
 */
function addDisplayNameTransformer(options = {}) {
  const optionsWithDefaults = {
    onlyFileRoot: false,
    funcTypes: ['React.FunctionComponent', 'React.FC', 'FunctionComponent', 'FC'],
    classTypes: ['React.Component', 'React.PureComponent'],
    factoryFuncs: ['React.forwardRef', 'React.memo'],
    ...options,
  };
  return (ctx) => {
    return (sf) => ts.visitNode(sf, visit(ctx, sf, optionsWithDefaults));
  };
}
exports.addDisplayNameTransformer = addDisplayNameTransformer;
