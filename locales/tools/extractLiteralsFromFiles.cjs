'use strict';

const fs = require('fs');
const path = require('path');

const ts = require('typescript');

/**
 * Enhanced Translation Extraction Tool
 *
 * This enhanced version extracts much more context information to help translators
 * provide better translations.
 */

class EnhancedTranslationExtractor {
  constructor() {
    this.literals = new Map();
  }

  // Extract string from binary expressions (concatenation)
  extractStringFromBinaryExpression(node) {
    const left = node.left;
    const right = node.right;
    let leftString = null;
    let rightString = null;

    if (ts.isStringLiteral(left)) {
      leftString = left.text;
    } else if (ts.isBinaryExpression(left)) {
      leftString = this.extractStringFromBinaryExpression(left);
    }

    if (ts.isStringLiteral(right)) {
      rightString = right.text;
    } else if (ts.isBinaryExpression(right)) {
      rightString = this.extractStringFromBinaryExpression(right);
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

  // Analyze variables in translation string
  analyzeVariables(text) {
    const variables = {};
    const variablePattern = /\{([^}]+)\}/g;
    let match;

    while ((match = variablePattern.exec(text)) !== null) {
      const varName = match[1];
      variables[varName] = {
        type: this.inferVariableType(varName),
      };
    }

    return variables;
  }

  // Infer variable type from name patterns
  inferVariableType(varName) {
    const lowerName = varName.toLowerCase();

    if (/count|number|total|amount|size|length|index|page/.test(lowerName)) {
      return 'number';
    }
    if (/date|time|created|updated|expires/.test(lowerName)) {
      return 'date';
    }
    if (/name|title|label|text|message|description/.test(lowerName)) {
      return 'string';
    }
    if (/url|link|href|path/.test(lowerName)) {
      return 'url';
    }
    if (/email|mail/.test(lowerName)) {
      return 'email';
    }

    return 'unknown';
  }

  // Determine UI element type from context
  getUIElementType(node) {
    let parent = node.parent;
    let elementType = 'unknown';
    let attributes = {};

    // Traverse up to find JSX or component context
    while (parent) {
      if (ts.isJsxElement(parent) || ts.isJsxSelfClosingElement(parent)) {
        const tagName = parent.tagName?.escapedText || parent.tagName?.text;

        if (tagName) {
          elementType = this.mapJSXTagToUIType(tagName);
          attributes = this.extractJSXAttributes(parent);
          break;
        }
      }

      if (ts.isPropertyAssignment(parent)) {
        const propertyName = parent.name?.text;
        if (propertyName) {
          elementType = this.mapPropertyToUIType(propertyName);
          break;
        }
      }

      if (ts.isCallExpression(parent)) {
        const functionName =
          parent.expression?.text || parent.expression?.name?.text;
        if (functionName) {
          elementType = this.mapFunctionToUIType(functionName);
          break;
        }
      }

      parent = parent.parent;
    }

    return { type: elementType, attributes };
  }

  // Map JSX tag names to UI element types
  mapJSXTagToUIType(tagName) {
    const mapping = {
      button: 'button',
      Button: 'button',
      SubmitButton: 'submit_button',
      ActionButton: 'action_button',
      DeleteButton: 'delete_button',
      CancelButton: 'cancel_button',
      input: 'input_field',
      Input: 'input_field',
      textarea: 'textarea',
      select: 'select_field',
      Select: 'select_field',
      option: 'select_option',
      label: 'field_label',
      h1: 'page_title',
      h2: 'section_title',
      h3: 'subsection_title',
      p: 'paragraph',
      span: 'text_span',
      div: 'container',
      Modal: 'modal_dialog',
      ModalDialog: 'modal_dialog',
      Alert: 'alert_message',
      Tooltip: 'tooltip',
      Tab: 'tab_label',
      MenuItem: 'menu_item',
      Link: 'link',
      NavLink: 'navigation_link',
    };

    return mapping[tagName] || 'generic_element';
  }

  // Map property names to UI context
  mapPropertyToUIType(propertyName) {
    const mapping = {
      title: 'title',
      label: 'label',
      placeholder: 'placeholder',
      text: 'text_content',
      children: 'content',
      value: 'value',
      defaultValue: 'default_value',
      alt: 'alt_text',
      'aria-label': 'accessibility_label',
      tooltip: 'tooltip',
      helpText: 'help_text',
      errorMessage: 'error_message',
      successMessage: 'success_message',
      warningMessage: 'warning_message',
    };

    return mapping[propertyName] || 'property_value';
  }

  // Map function names to UI context
  mapFunctionToUIType(functionName) {
    if (/toast|notify|alert/i.test(functionName)) {
      return 'notification_message';
    }
    if (/confirm|dialog/i.test(functionName)) {
      return 'dialog_message';
    }
    if (/error|fail/i.test(functionName)) {
      return 'error_message';
    }
    if (/success/i.test(functionName)) {
      return 'success_message';
    }
    if (/warn/i.test(functionName)) {
      return 'warning_message';
    }

    return 'function_call';
  }

  // Extract JSX attributes for additional context
  extractJSXAttributes(jsxNode) {
    const attributes = {};

    if (jsxNode.attributes) {
      jsxNode.attributes.properties?.forEach((attr) => {
        if (ts.isJsxAttribute(attr) && attr.name?.text) {
          const attrName = attr.name.text;
          let attrValue = 'true';

          if (attr.initializer) {
            if (ts.isStringLiteral(attr.initializer)) {
              attrValue = attr.initializer.text;
            } else if (ts.isJsxExpression(attr.initializer)) {
              attrValue = attr.initializer.expression?.text || 'expression';
            }
          }

          attributes[attrName] = attrValue;
        }
      });
    }

    return attributes;
  }

  // Get semantic context from surrounding code
  getSemanticContext(node, sourceFile) {
    const context = {
      lineNumber:
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      isConditional: false,
      isInLoop: false,
      isInFunction: false,
      functionName: null,
      containingComponent: null,
      nearbyStrings: [],
    };

    let parent = node.parent;

    // Traverse up to gather context
    while (parent) {
      // Check for conditional statements
      if (ts.isIfStatement(parent) || ts.isConditionalExpression(parent)) {
        context.isConditional = true;
      }

      // Check for loops
      if (
        ts.isForStatement(parent) ||
        ts.isWhileStatement(parent) ||
        ts.isForInStatement(parent) ||
        ts.isForOfStatement(parent)
      ) {
        context.isInLoop = true;
      }

      // Check for function context
      if (
        ts.isFunctionDeclaration(parent) ||
        ts.isArrowFunction(parent) ||
        ts.isMethodDeclaration(parent)
      ) {
        context.isInFunction = true;
        context.functionName = parent.name?.text || 'anonymous';
      }

      // Check for React component
      if (
        ts.isFunctionDeclaration(parent) &&
        /^[A-Z]/.test(parent.name?.text)
      ) {
        context.containingComponent = parent.name.text;
      }

      parent = parent.parent;
    }

    return context;
  }

  // Analyze text characteristics
  analyzeTextCharacteristics(text) {
    return {
      length: text.length,
      wordCount: text.trim().split(/\s+/).length,
      hasVariables: /\{[^}]+\}/.test(text),
      hasMarkup: /<[^>]+>/.test(text),
      isQuestion: text.trim().endsWith('?'),
      isExclamation: text.trim().endsWith('!'),
      isSentence: /^[A-Z].*[.!?]$/.test(text.trim()),
      startsWithCapital: /^[A-Z]/.test(text.trim()),
      hasNumbers: /\d/.test(text),
      hasSpecialChars: /[^a-zA-Z0-9\s{}<>/]/.test(text),
      isAllCaps: text === text.toUpperCase() && text.length > 1,
      // Removed language field - source is always English
    };
  }

  // PHASE 1 ENHANCEMENTS

  // Extract file and domain context from file path
  getFileContext(filePath) {
    const relativePath = path.relative(
      path.join(__dirname, '../../src'),
      filePath,
    );
    const pathParts = relativePath.split(path.sep);

    // Determine domain from path structure
    const domain = this.inferDomain(pathParts);
    const featureArea = this.inferFeatureArea(pathParts);
    const componentType = this.inferComponentType(
      pathParts,
      path.basename(filePath),
    );

    return {
      domain,
      feature_area: featureArea,
      component_type: componentType,
      file_path: relativePath,
      directory_depth: pathParts.length,
      file_size_category: this.getFileSizeCategory(filePath),
    };
  }

  // Infer domain from file path
  inferDomain(pathParts) {
    const domainMappings = {
      marketplace: 'marketplace',
      customer: 'customer_management',
      project: 'project_management',
      user: 'user_management',
      invoices: 'billing',
      administration: 'admin',
      support: 'support',
      issues: 'support',
      auth: 'authentication',
      dashboard: 'dashboard',
      resource: 'resource_management',
      openstack: 'infrastructure',
      rancher: 'infrastructure',
      slurm: 'infrastructure',
      vmware: 'infrastructure',
      azure: 'infrastructure',
    };

    for (const part of pathParts) {
      if (domainMappings[part]) {
        return domainMappings[part];
      }
    }
    return 'general';
  }

  // Infer feature area from path
  inferFeatureArea(pathParts) {
    if (pathParts.length < 2) return 'general';

    // Take the most specific path segment that's not a filename
    const specificParts = pathParts
      .slice(0, -1)
      .filter(
        (part) =>
          !part.includes('.') && part !== 'components' && part !== 'forms',
      );

    return specificParts[specificParts.length - 1] || 'general';
  }

  // Infer component type from filename and path
  inferComponentType(pathParts, filename) {
    const typeIndicators = {
      dialog: /Dialog|Modal/i,
      form: /Form|Create|Edit|Update/i,
      list: /List|Table|Grid/i,
      page: /Page|View/i,
      card: /Card|Item/i,
      filter: /Filter|Search/i,
      button: /Button|Action/i,
      field: /Field|Input/i,
      navigation: /Nav|Menu|Sidebar/i,
      chart: /Chart|Graph|Visualization/i,
    };

    for (const [type, pattern] of Object.entries(typeIndicators)) {
      if (
        pattern.test(filename) ||
        pathParts.some((part) => pattern.test(part))
      ) {
        return type;
      }
    }
    return 'component';
  }

  // Get file size category
  getFileSizeCategory(filePath) {
    try {
      const stats = require('fs').statSync(filePath);
      const sizeKB = stats.size / 1024;

      if (sizeKB < 5) return 'small';
      if (sizeKB < 20) return 'medium';
      return 'large';
    } catch {
      return 'unknown';
    }
  }

  // Enhanced JSX attributes extraction
  getJSXContext(node) {
    try {
      let jsxElement = node;

      // Traverse up to find JSX element
      while (
        jsxElement &&
        !ts.isJsxElement(jsxElement) &&
        !ts.isJsxSelfClosingElement(jsxElement)
      ) {
        jsxElement = jsxElement.parent;
      }

      if (!jsxElement) return null;

      const context = {
        jsx_tag: this.getJSXTagName(jsxElement),
        jsx_attributes: this.extractJSXAttributes(jsxElement),
        is_self_closing: ts.isJsxSelfClosingElement(jsxElement),
        conditional_render: this.isConditionallyRendered(jsxElement),
      };

      return context;
    } catch {
      // Safe fallback for AST parsing issues
      return null;
    }
  }

  // Get JSX tag name
  getJSXTagName(jsxElement) {
    if (ts.isJsxElement(jsxElement)) {
      return (
        jsxElement.openingElement.tagName.text ||
        jsxElement.openingElement.tagName.escapedText
      );
    } else if (ts.isJsxSelfClosingElement(jsxElement)) {
      return jsxElement.tagName.text || jsxElement.tagName.escapedText;
    }
    return 'unknown';
  }

  // Check if JSX element is conditionally rendered
  isConditionallyRendered(jsxElement) {
    try {
      let parent = jsxElement.parent;

      while (parent) {
        // Check for logical AND expressions: {condition && <Element>}
        if (
          ts.isBinaryExpression(parent) &&
          parent.operatorToken?.kind === ts.SyntaxKind.AmpersandAmpersandToken
        ) {
          return true;
        }

        // Check for conditional expressions: {condition ? <A> : <B>}
        if (ts.isConditionalExpression(parent)) {
          return true;
        }

        parent = parent.parent;
      }

      return false;
    } catch {
      // Safe fallback for AST parsing issues
      return false;
    }
  }

  // Infer action type from function/variable names and context
  inferActionType(functionName, variableNames, uiType) {
    const actionPatterns = {
      create: /create|add|new|insert|register|submit/i,
      read: /get|fetch|load|read|show|view|display/i,
      update: /update|edit|modify|change|save|patch/i,
      delete: /delete|remove|destroy|cancel|clear/i,
      navigate: /goto|navigate|redirect|route|push/i,
      confirm: /confirm|accept|approve|ok/i,
      cancel: /cancel|dismiss|close|abort/i,
      export: /export|download|save/i,
      import: /import|upload|load/i,
      filter: /filter|search|query|find/i,
      sort: /sort|order|arrange/i,
      refresh: /refresh|reload|sync|update/i,
    };

    const contextText = [functionName, ...variableNames, uiType]
      .join(' ')
      .toLowerCase();

    for (const [action, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(contextText)) {
        return action;
      }
    }

    return 'unknown';
  }

  // PHASE 2 ENHANCEMENTS

  // Extract component hierarchy and relationships
  getComponentHierarchy(node, _sourceFile) {
    const hierarchy = {
      parent_components: [],
      child_elements: [],
      sibling_count: 0,
      nesting_level: 0,
    };

    let current = node;
    let level = 0;

    // Traverse up to collect parent components
    while (current && level < 10) {
      // Limit to prevent infinite loops
      current = current.parent;
      level++;

      if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) {
        const tagName = this.getJSXTagName(current);
        if (tagName && /^[A-Z]/.test(tagName)) {
          // React component (starts with capital)
          hierarchy.parent_components.push(tagName);
        }
        hierarchy.nesting_level = level;
      }

      // Count siblings at JSX level
      if (ts.isJsxElement(current)) {
        hierarchy.sibling_count = current.children
          ? current.children.length
          : 0;
      }
    }

    return hierarchy;
  }

  // Detect state modifications
  detectStateModifications(node, sourceFile) {
    const stateContext = {
      modifies_state: false,
      state_variables: [],
      hook_usage: [],
      side_effects: false,
    };

    // Look for state modifications in the surrounding function
    let functionNode = node;
    while (
      functionNode &&
      !ts.isFunctionDeclaration(functionNode) &&
      !ts.isArrowFunction(functionNode)
    ) {
      functionNode = functionNode.parent;
    }

    if (functionNode) {
      const sourceText = sourceFile.getFullText();
      const functionText = sourceText.substring(
        functionNode.getFullStart(),
        functionNode.getEnd(),
      );

      // Detect React hooks
      const hookPatterns = {
        useState: /useState\s*\(/g,
        useEffect: /useEffect\s*\(/g,
        useCallback: /useCallback\s*\(/g,
        useMemo: /useMemo\s*\(/g,
        useReducer: /useReducer\s*\(/g,
        useContext: /useContext\s*\(/g,
      };

      for (const [hook, pattern] of Object.entries(hookPatterns)) {
        if (pattern.test(functionText)) {
          stateContext.hook_usage.push(hook);
          if (hook === 'useState' || hook === 'useReducer') {
            stateContext.modifies_state = true;
          }
        }
      }

      // Detect setState calls
      if (/setState|dispatch/.test(functionText)) {
        stateContext.modifies_state = true;
      }

      // Detect side effects
      if (
        /fetch|axios|\.post|\.get|\.put|\.delete|localStorage|sessionStorage/.test(
          functionText,
        )
      ) {
        stateContext.side_effects = true;
      }
    }

    return stateContext;
  }

  // Detect navigation triggers
  detectNavigationTriggers(node, sourceFile) {
    const navigationContext = {
      triggers_navigation: false,
      navigation_type: null,
      target_route: null,
    };

    let functionNode = node;
    while (
      functionNode &&
      !ts.isFunctionDeclaration(functionNode) &&
      !ts.isArrowFunction(functionNode)
    ) {
      functionNode = functionNode.parent;
    }

    if (functionNode) {
      const sourceText = sourceFile.getFullText();
      const functionText = sourceText.substring(
        functionNode.getFullStart(),
        functionNode.getEnd(),
      );

      // Detect navigation patterns
      const navigationPatterns = {
        router_push: /router\.push|navigate\(/,
        link_component: /<Link\s+to=|<NavLink/,
        window_location: /window\.location|location\.href/,
        history_api: /history\.push|history\.replace/,
      };

      for (const [type, pattern] of Object.entries(navigationPatterns)) {
        if (pattern.test(functionText)) {
          navigationContext.triggers_navigation = true;
          navigationContext.navigation_type = type;
          break;
        }
      }
    }

    return navigationContext;
  }

  // Detect validation context
  detectValidationContext(node, sourceFile) {
    const validationContext = {
      has_validation: false,
      validation_library: null,
      form_field: null,
      required: false,
      validation_rules: [],
    };

    // Check for validation in the file imports and surrounding context
    const sourceText = sourceFile.getFullText();

    // Detect validation libraries
    const validationLibraries = {
      yup: /import.*yup|from ['"]yup['"]/,
      joi: /import.*joi|from ['"]joi['"]/,
      zod: /import.*zod|from ['"]zod['"]/,
      'react-hook-form': /import.*react-hook-form/,
      'final-form': /import.*final-form/,
      formik: /import.*formik/,
    };

    for (const [library, pattern] of Object.entries(validationLibraries)) {
      if (pattern.test(sourceText)) {
        validationContext.has_validation = true;
        validationContext.validation_library = library;
        break;
      }
    }

    // Look for validation keywords near the translation
    let parent = node.parent;
    let searchDepth = 0;

    while (parent && searchDepth < 5) {
      const parentText = sourceText.substring(
        parent.getFullStart(),
        parent.getEnd(),
      );

      if (/required|validate|validation|error/.test(parentText.toLowerCase())) {
        validationContext.has_validation = true;

        if (/required/.test(parentText.toLowerCase())) {
          validationContext.required = true;
          validationContext.validation_rules.push('required');
        }
      }

      parent = parent.parent;
      searchDepth++;
    }

    return validationContext;
  }

  // Detect API context from nearby code
  detectAPIContext(node, sourceFile) {
    const apiContext = {
      has_api_call: false,
      api_endpoint: null,
      http_method: null,
      async_operation: false,
    };

    let functionNode = node;
    while (
      functionNode &&
      !ts.isFunctionDeclaration(functionNode) &&
      !ts.isArrowFunction(functionNode)
    ) {
      functionNode = functionNode.parent;
    }

    if (functionNode) {
      const sourceText = sourceFile.getFullText();
      const functionText = sourceText.substring(
        functionNode.getFullStart(),
        functionNode.getEnd(),
      );

      // Detect async functions
      if (/async\s+function|async\s*\(|=>\s*{[\s\S]*await/.test(functionText)) {
        apiContext.async_operation = true;
      }

      // Detect API endpoints and methods
      const apiPatterns = [
        { pattern: /fetch\s*\(\s*['"`]([^'"`]+)['"`]/, method: 'GET' },
        { pattern: /axios\.get\s*\(\s*['"`]([^'"`]+)['"`]/, method: 'GET' },
        { pattern: /axios\.post\s*\(\s*['"`]([^'"`]+)['"`]/, method: 'POST' },
        { pattern: /axios\.put\s*\(\s*['"`]([^'"`]+)['"`]/, method: 'PUT' },
        {
          pattern: /axios\.delete\s*\(\s*['"`]([^'"`]+)['"`]/,
          method: 'DELETE',
        },
        { pattern: /\.post\s*\(\s*['"`]([^'"`]+)['"`]/, method: 'POST' },
        { pattern: /\.get\s*\(\s*['"`]([^'"`]+)['"`]/, method: 'GET' },
      ];

      for (const { pattern, method } of apiPatterns) {
        const match = functionText.match(pattern);
        if (match) {
          apiContext.has_api_call = true;
          apiContext.api_endpoint = match[1];
          apiContext.http_method = method;
          break;
        }
      }
    }

    return apiContext;
  }

  // Main extraction function for translate() calls
  extractStringLiteralFromTranslate(node, filePath, sourceFile) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'translate' &&
      node.arguments.length > 0
    ) {
      const firstArg = node.arguments[0];
      let literal = null;

      if (ts.isStringLiteral(firstArg)) {
        literal = firstArg.text;
      } else if (ts.isBinaryExpression(firstArg)) {
        literal = this.extractStringFromBinaryExpression(firstArg);
      }

      if (literal !== null) {
        const relativeFilePath = path.relative(
          path.join(__dirname, '../../src'),
          filePath,
        );

        // Extract comprehensive context
        const uiContext = this.getUIElementType(node);
        const semanticContext = this.getSemanticContext(node, sourceFile);
        const variables = this.analyzeVariables(literal);
        const textCharacteristics = this.analyzeTextCharacteristics(literal);

        // Extract enhanced context information
        let fileContext,
          jsxContext,
          apiContext,
          componentHierarchy,
          stateContext,
          navigationContext,
          validationContext;

        try {
          fileContext = this.getFileContext(filePath);
          jsxContext = this.getJSXContext(node);
          apiContext = this.detectAPIContext(node, sourceFile);
          componentHierarchy = this.getComponentHierarchy(node, sourceFile);
          stateContext = this.detectStateModifications(node, sourceFile);
          navigationContext = this.detectNavigationTriggers(node, sourceFile);
          validationContext = this.detectValidationContext(node, sourceFile);
        } catch {
          // Continue with null values if context extraction fails
          fileContext =
            jsxContext =
            apiContext =
            componentHierarchy =
            stateContext =
            navigationContext =
            validationContext =
              null;
        }

        // Infer action type from all available context
        const actionType = this.inferActionType(
          semanticContext.functionName || '',
          Object.keys(variables),
          uiContext.type,
        );

        // Get second argument (interpolation context) if present
        let interpolationHint = null;
        if (
          node.arguments.length > 1 &&
          ts.isObjectLiteralExpression(node.arguments[1])
        ) {
          const obj = node.arguments[1];
          interpolationHint = {};
          obj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              interpolationHint[prop.name.text] = 'variable_reference';
            }
          });
        }

        // Store or update entry
        if (!this.literals.has(literal)) {
          this.literals.set(literal, {
            message: literal,
            locations: new Set(),
            contexts: [],
            variables,
            textCharacteristics,
          });
        }

        const entry = this.literals.get(literal);
        entry.locations.add(relativeFilePath);

        // Add enhanced context information
        entry.contexts.push({
          file: relativeFilePath,
          line: semanticContext.lineNumber,

          // UI and semantic context
          uiElementType: uiContext.type,
          uiAttributes: uiContext.attributes,
          semanticContext: {
            isConditional: semanticContext.isConditional,
            isInLoop: semanticContext.isInLoop,
            functionName: semanticContext.functionName,
            component: semanticContext.containingComponent,
          },
          interpolationHint,

          // File and component context
          fileContext,
          jsxContext,
          actionType,
          apiContext,

          // Advanced analysis context
          componentHierarchy,
          stateContext,
          navigationContext,
          validationContext,
        });
      }
    }

    ts.forEachChild(node, (childNode) => {
      this.extractStringLiteralFromTranslate(childNode, filePath, sourceFile);
    });
  }

  // Get all TypeScript files recursively
  getAllTSFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        this.getAllTSFiles(fullPath, arrayOfFiles);
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  // Determine if string is user-facing
  isUserFacingString(uiTypes, characteristics) {
    const nonUserFacingTypes = ['property_value', 'function_call', 'unknown'];
    const hasUserFacingType = uiTypes.some(
      (type) => !nonUserFacingTypes.includes(type),
    );
    const looksLikeUserText =
      characteristics.isSentence || characteristics.startsWithCapital;

    return hasUserFacingType || looksLikeUserText;
  }

  // Determine primary UI context
  determinePrimaryContext(contexts, uiTypes) {
    // Priority order for UI types
    const typePriority = {
      button: 10,
      submit_button: 9,
      action_button: 8,
      title: 7,
      label: 6,
      error_message: 5,
      success_message: 4,
      modal_dialog: 3,
      notification_message: 2,
      text_content: 1,
    };

    let bestType = 'unknown';
    let bestPriority = 0;

    for (const type of uiTypes) {
      const priority = typePriority[type] || 0;
      if (priority > bestPriority) {
        bestPriority = priority;
        bestType = type;
      }
    }

    return bestType;
  }

  // Generate translator notes
  generateTranslatorNotes(data, uiTypes, primaryContext) {
    const notes = [];

    // Context-specific notes
    if (primaryContext === 'button') {
      notes.push(
        'This text appears on a button. Keep it short and action-oriented.',
      );
    } else if (primaryContext.includes('title')) {
      notes.push(
        'This is a title/heading. Use title case if appropriate in your language.',
      );
    } else if (primaryContext.includes('message')) {
      notes.push(
        'This is a user message. Ensure tone is appropriate for the context.',
      );
    }

    // Variable notes
    if (Object.keys(data.variables).length > 0) {
      const varTypes = Object.values(data.variables).map((v) => v.type);
      notes.push(
        `Contains variables: ${Object.keys(data.variables).join(', ')}. Variable types: ${[...new Set(varTypes)].join(', ')}.`,
      );
    }

    // Text characteristic notes
    if (data.textCharacteristics.hasMarkup) {
      notes.push(
        'Contains HTML/JSX markup. Preserve all tags and their structure.',
      );
    }

    if (data.textCharacteristics.isQuestion) {
      notes.push(
        'This is a question. Ensure question format is appropriate in your language.',
      );
    }

    if (data.textCharacteristics.isAllCaps) {
      notes.push(
        'Original text is in ALL CAPS. Consider if this emphasis is appropriate in your language.',
      );
    }

    return notes.length > 0 ? notes : undefined;
  }

  // Determine primary UI type from list of types
  determinePrimaryUIType(uiTypes) {
    if (!uiTypes || uiTypes.length === 0) return 'unknown';

    // Priority order for UI types
    const typePriority = {
      submit_button: 10,
      action_button: 9,
      delete_button: 8,
      title: 7,
      label: 6,
      error_message: 5,
      success_message: 4,
      modal_dialog: 3,
      notification_message: 2,
      text_content: 1,
    };

    let bestType = 'unknown';
    let bestPriority = 0;

    for (const type of uiTypes) {
      const priority = typePriority[type] || 0;
      if (priority > bestPriority) {
        bestPriority = priority;
        bestType = type;
      }
    }

    return bestType;
  }

  // Generate enhanced template with new context data
  generateEnhancedTemplate() {
    const template = {};

    for (const [literal, entry] of this.literals) {
      // Only the fields a consumer actually reads are aggregated and persisted,
      // and only when they carry information. The rest of what this used to emit
      // was dead (nothing under locales/tools/ read `ui_types`, `components`,
      // `jsx_context`, `interaction_context`, `file_context.paths`,
      // `api_context.endpoints` or `usage_count`), a duplicate of the key
      // (`message`), constant (`is_user_facing`), or derivable on demand
      // (`text_characteristics` and `translator_notes`, both now built by
      // simpleLLMProcessor — the only consumer that ever wanted them). Storing
      // it all cost 19 MB and made every regeneration an unreviewable diff.
      // See waldur/waldur-homeport#229.
      const context = {};

      const primaryUiType = this.determinePrimaryUIType([
        ...new Set(
          entry.contexts.map((ctx) => ctx.uiElementType).filter(Boolean),
        ),
      ]);
      if (primaryUiType && primaryUiType !== 'unknown') {
        context.primary_ui_type = primaryUiType;
      }

      if (entry.variables && Object.keys(entry.variables).length > 0) {
        context.variables = entry.variables;
      }

      // One feature area is all any consumer reads, and "general" says nothing.
      const featureArea = entry.contexts
        .map((ctx) => ctx.fileContext?.feature_area)
        .find((area) => area && area !== 'general');
      if (featureArea) {
        context.feature_area = featureArea;
      }

      const actionType = entry.contexts
        .map((ctx) => ctx.actionType)
        .find((type) => type && type !== 'unknown');
      if (actionType) {
        context.action_type = actionType;
      }

      if (entry.contexts.some((ctx) => ctx.apiContext?.api_endpoint)) {
        context.has_api_calls = true;
      }

      template[literal] = Object.keys(context).length > 0 ? { context } : {};
    }

    // Sorted on write. The map is built in source-discovery order, so without
    // this any added or removed source file shuffles unrelated entries and the
    // diff records reordering rather than what actually changed.
    //
    // One caveat: JS hoists integer-like keys to the front of an object, so the
    // "12345678" string lands first whatever we do here. That is stable and
    // deterministic, so diffs stay clean -- but a reader checking the output
    // with a sort that has no such rule will see index 0 disagree.
    return Object.fromEntries(
      Object.entries(template).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  }

  // Process a single TypeScript file with enhanced error handling
  processFile(filePath) {
    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        path.basename(filePath),
        sourceCode,
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );

      this.extractStringLiteralFromTranslate(sourceFile, filePath, sourceFile);
    } catch (error) {
      // Silently skip problematic files - most don't contain translate() calls anyway
      const fileName = path.basename(filePath);
      const errorMsg = error.message.split('\n')[0]; // Get first line of error

      // Only show warning for unexpected errors, not AST parsing issues
      if (!errorMsg.includes('Cannot read properties of undefined')) {
        console.warn(
          `Warning: Could not process file ${fileName}: ${errorMsg}`,
        );
      }
      // AST parsing warnings are now suppressed as they're typically harmless
    }
  }

  // Main execution
  run(outputFileName = 'template.json') {
    console.log('🔄 Starting enhanced translation extraction...\n');

    const rootDir = path.join(__dirname, '../../');
    const srcDir = path.join(rootDir, 'src');
    const outputFile = path.join(rootDir, outputFileName);

    // Get all TypeScript files
    const tsFiles = this.getAllTSFiles(srcDir);
    console.log(`📁 Found ${tsFiles.length} TypeScript files`);

    // Process all files with enhanced error handling
    let processedCount = 0;
    let skippedCount = 0;

    tsFiles.forEach((filePath) => {
      try {
        this.processFile(filePath);
        processedCount++;
      } catch {
        skippedCount++;
      }
    });

    console.log(
      `✅ Extracted ${this.literals.size} unique translation strings`,
    );
    if (skippedCount > 0) {
      console.log(
        `📁 Processed ${processedCount} files successfully, skipped ${skippedCount} files with parsing issues`,
      );
    }

    // Generate enhanced template
    const template = this.generateEnhancedTemplate();

    // Save to file
    fs.writeFileSync(outputFile, JSON.stringify(template, null, 2), 'utf8');

    console.log(`💾 Enhanced template saved to: ${path.basename(outputFile)}`);

    // Statistics
    const entries = Object.values(template);
    const withVariables = entries.filter(
      (entry) => entry.context?.variables,
    ).length;
    const withContext = entries.filter((entry) => entry.context).length;
    const uiTypes = [
      ...new Set(
        entries.map((entry) => entry.context?.primary_ui_type).filter(Boolean),
      ),
    ];
    const bytes = fs.statSync(outputFile).size;

    console.log('\n📊 Statistics:');
    console.log(`Strings with context: ${withContext}/${this.literals.size}`);
    console.log(`Strings with variables: ${withVariables}`);
    console.log(`UI element types found: ${uiTypes.length}`);
    console.log(
      `Primary UI types: ${uiTypes.slice(0, 10).join(', ')}${uiTypes.length > 10 ? '...' : ''}`,
    );
    console.log(`Template size: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  }
}

// Execute if run directly
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse command line arguments
  let outputFileName = 'template.json'; // Default to template.json for compatibility
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--output':
      case '-o':
        outputFileName = args[++i] || 'template.json';
        break;
      case '--enhanced':
        outputFileName = 'template-enhanced.json';
        break;
      case '--help':
      case '-h':
        showHelp = true;
        break;
    }
  }

  if (showHelp) {
    console.log(`
Enhanced Translation Extraction Tool

Usage: node extractLiteralsFromFilesEnhanced.cjs [options]

Options:
  --output, -o FILE    Output file name (default: template.json)
  --enhanced          Output to template-enhanced.json with full context
  --help, -h          Show this help message

Examples:
  node extractLiteralsFromFilesEnhanced.cjs
  node extractLiteralsFromFilesEnhanced.cjs --enhanced
  node extractLiteralsFromFilesEnhanced.cjs --output custom-template.json
    `);
    process.exit(0);
  }

  const extractor = new EnhancedTranslationExtractor();
  extractor.run(outputFileName);
}

module.exports = EnhancedTranslationExtractor;
