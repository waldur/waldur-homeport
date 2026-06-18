import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

import { initMonaco } from '@/form/monacoSetup';
import { LoadingSpinner } from '@/table/TableRefreshButton';

// Django HTML language configuration based on official Django documentation
const configureDjangoHTML = (monaco) => {
  monaco.languages.register({ id: 'django-html' });

  monaco.languages.setLanguageConfiguration('django-html', {
    comments: {
      blockComment: ['{#', '#}'],
    },
    brackets: [
      ['<!--', '-->'],
      ['<', '>'],
      ['{%', '%}'],
      ['{{', '}}'],
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{%', close: '%}' },
      { open: '{{', close: '}}' },
      { open: '{#', close: '#}' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: '{%', close: '%}' },
      { open: '{{', close: '}}' },
      { open: '{#', close: '#}' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '<', close: '>' },
    ],
    folding: {
      markers: {
        start:
          /({%\s*(?:autoescape|block|comment|filter|for|if|ifchanged|spaceless|verbatim|with))/,
        end: /({%\s*(?:endautoescape|endblock|endcomment|endfilter|endfor|endif|endifchanged|endspaceless|endverbatim|endwith)\s*%})/,
      },
    },
  });

  monaco.languages.setMonarchTokensProvider('django-html', {
    defaultToken: '',
    tokenPostfix: '.django-html',

    // Built-in template tags from Django docs
    keywords: [
      'autoescape',
      'endautoescape',
      'block',
      'endblock',
      'comment',
      'endcomment',
      'csrf_token',
      'cycle',
      'debug',
      'extends',
      'filter',
      'endfilter',
      'firstof',
      'for',
      'endfor',
      'empty',
      'if',
      'endif',
      'elif',
      'else',
      'ifchanged',
      'endifchanged',
      'include',
      'load',
      'lorem',
      'now',
      'querystring',
      'regroup',
      'resetcycle',
      'spaceless',
      'endspaceless',
      'templatetag',
      'url',
      'verbatim',
      'endverbatim',
      'widthratio',
      'with',
      'endwith',
      // i18n tags
      'trans',
      'blocktrans',
      'endblocktrans',
      'translate',
      'blocktranslate',
      'endblocktranslate',
      'language',
      'get_available_languages',
      'get_language_info',
      'get_language_info_list',
      // static tags
      'static',
      'get_static_prefix',
      'get_media_prefix',
    ],

    // Control keywords
    controlKeywords: [
      'and',
      'or',
      'not',
      'in',
      'is',
      'as',
      'by',
      'reversed',
      'only',
      'silent',
    ],

    // Template tag arguments
    templatetagArgs: [
      'openblock',
      'closeblock',
      'openvariable',
      'closevariable',
      'openbrace',
      'closebrace',
      'opencomment',
      'closecomment',
    ],

    // Built-in constants
    constants: ['true', 'false', 'none', 'True', 'False', 'None'],

    // Built-in variables (forloop)
    builtinVariables: ['forloop', 'block', 'self', 'super'],

    // forloop attributes
    forloopAttrs: [
      'counter',
      'counter0',
      'revcounter',
      'revcounter0',
      'first',
      'last',
      'parentloop',
    ],

    // Built-in filters from Django docs
    filters: [
      'add',
      'addslashes',
      'capfirst',
      'center',
      'cut',
      'date',
      'default',
      'default_if_none',
      'dictsort',
      'dictsortreversed',
      'divisibleby',
      'escape',
      'escapejs',
      'escapeseq',
      'filesizeformat',
      'first',
      'floatformat',
      'force_escape',
      'get_digit',
      'iriencode',
      'join',
      'json_script',
      'last',
      'length',
      'length_is',
      'linebreaks',
      'linebreaksbr',
      'linenumbers',
      'ljust',
      'lower',
      'make_list',
      'phone2numeric',
      'pluralize',
      'pprint',
      'random',
      'rjust',
      'safe',
      'safeseq',
      'slice',
      'slugify',
      'stringformat',
      'striptags',
      'time',
      'timesince',
      'timeuntil',
      'title',
      'truncatechars',
      'truncatechars_html',
      'truncatewords',
      'truncatewords_html',
      'unordered_list',
      'upper',
      'urlencode',
      'urlize',
      'urlizetrunc',
      'wordcount',
      'wordwrap',
      'yesno',
      // humanize filters
      'apnumber',
      'intcomma',
      'intword',
      'naturalday',
      'naturaltime',
      'ordinal',
    ],

    // Operators
    operators: [
      '+',
      '-',
      '*',
      '**',
      '/',
      '//',
      '%',
      '==',
      '!=',
      '<',
      '>',
      '<=',
      '>=',
      '~',
      '|',
    ],

    tokenizer: {
      root: [
        // Django raw/verbatim blocks
        [
          /{%\s*(?:raw|verbatim)(?:\s+\w+)?\s*%}/,
          'keyword.tag.django',
          '@djangoRaw',
        ],

        // Django comments
        [/{#/, 'comment.block.django', '@djangoComment'],

        // Django variables
        [/{{/, 'delimiter.variable.django', '@djangoVariable'],

        // Django tags
        [/{%/, 'delimiter.tag.django', '@djangoTag'],

        // HTML DOCTYPE
        [/<!DOCTYPE/, 'metatag.html', '@doctype'],

        // HTML comments
        [/<!--/, 'comment.html', '@htmlComment'],

        // HTML tags
        [/(<)([\w-]+)/, ['delimiter.html', 'tag.html'], '@htmlTag'],
        [
          /(<\/)([\w-]+)(\s*)(>)/,
          ['delimiter.html', 'tag.html', '', 'delimiter.html'],
        ],

        // Text content
        [/[^<{]+/, 'text.html'],
        [/</, 'text.html'],
      ],

      djangoRaw: [
        [
          /{%\s*end(?:raw|verbatim)(?:\s+\w+)?\s*%}/,
          'keyword.tag.django',
          '@pop',
        ],
        [/[^{]+/, 'raw.django'],
        [/{/, 'raw.django'],
      ],

      djangoComment: [
        [/#}/, 'comment.block.django', '@pop'],
        [/[^#]+/, 'comment.content.django'],
        [/./, 'comment.content.django'],
      ],

      djangoVariable: [
        [/}}/, 'delimiter.variable.django', '@pop'],
        { include: '@expression' },
      ],

      djangoTag: [
        [/%}/, 'delimiter.tag.django', '@pop'],

        // Special patterns for specific tags
        [
          /\s*\b(block)\s+([a-zA-Z_][\w]*)/,
          ['keyword.control.django', 'entity.name.tag.django'],
        ],
        [
          /\s*\b(filter)\s+([a-zA-Z_][\w]*)/,
          ['keyword.control.django', 'variable.other.django'],
        ],
        [
          /\s*\b(extends|include)\s+/,
          'keyword.control.django',
          '@templatePath',
        ],
        [/\s*\b(load)\s+/, 'keyword.control.django', '@loadLibraries'],
        [/\s*\b(url)\s+/, 'keyword.control.django', '@urlTag'],
        [
          /\s*\b(static|get_static_prefix|get_media_prefix)\s+/,
          'keyword.control.django',
          '@staticTag',
        ],
        [/\s*\b(templatetag)\s+/, 'keyword.control.django', '@templatetagArg'],
        [/\s*\b(for)\s+/, 'keyword.control.django', '@forLoop'],
        [/\s*\b(regroup)\s+/, 'keyword.control.django', '@regroupTag'],
        [/\s*\b(cycle)\s+/, 'keyword.control.django', '@cycleTag'],
        [/\s*\b(now)\s+/, 'keyword.control.django', '@nowTag'],

        // First word after tag delimiter (for simple tags)
        [
          /(?<=^\s*)\b[a-zA-Z_][\w]*/,
          {
            cases: {
              '@keywords': 'keyword.control.django',
              '@default': 'entity.name.tag.django',
            },
          },
        ],

        { include: '@expression' },
      ],

      expression: [
        // Control keywords
        [
          /\b(?:and|or|not|in|is|as|by|reversed|only|silent)\b/,
          'keyword.control.django',
        ],

        // Constants
        [/\b(?:true|false|none|True|False|None)\b/, 'constant.language.django'],

        // Built-in variables
        [
          /\b(?:forloop|block|self|super)(?:\.(?:counter|counter0|revcounter|revcounter0|first|last|parentloop))?\b/,
          'variable.language.django',
        ],

        // Pipe with filter name
        [
          /(\|)([a-zA-Z_][\w]*)/,
          [
            'operator.django',
            {
              cases: {
                '@filters': 'support.function.django',
                '@default': 'support.function.django',
              },
            },
          ],
        ],

        // Dot notation for attributes
        [
          /(\.)([a-zA-Z_][\w]*)/,
          ['punctuation.accessor.django', 'variable.property.django'],
        ],

        // Operators
        [/\*\*|\/\/|==|!=|<=|>=/, 'operator.django'],
        [/[+\-*/%<>=]/, 'operator.django'],

        // Numbers
        [/\b\d+\.?\d*\b/, 'number.django'],

        // Strings
        [/"([^"\\]|\\.)*"/, 'string.django'],
        [/'([^'\\]|\\.)*'/, 'string.django'],

        // Brackets and parentheses
        [/[[\]()]/, 'punctuation.django'],
        [/[{}]/, 'punctuation.brace.django'],

        // Punctuation
        [/[:,]/, 'punctuation.django'],

        // Variables (must come after keywords)
        [/[a-zA-Z_][\w]*/, 'variable.other.django'],

        // Whitespace
        [/\s+/, ''],
      ],

      templatePath: [
        [/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/, 'string.path.django', '@pop'],
        [/[a-zA-Z_][\w.]*/, 'variable.other.django', '@pop'],
        [/%}/, 'delimiter.tag.django', '@pop'],
      ],

      loadLibraries: [
        [/\b(?:from)\b/, 'keyword.control.django'],
        [/[a-zA-Z_][\w.]*/, 'support.type.django'],
        [/%}/, 'delimiter.tag.django', '@pop'],
        [/\s+/, ''],
      ],

      urlTag: [
        [/'[^']*'|"[^"]*"/, 'string.django'],
        [/\b(?:as)\b/, 'keyword.control.django'],
        [/[a-zA-Z_][\w.]*/, 'variable.other.django'],
        [/%}/, 'delimiter.tag.django', '@pop'],
        { include: '@expression' },
      ],

      staticTag: [
        [/'[^']*'|"[^"]*"/, 'string.path.django'],
        [/\b(?:as)\b/, 'keyword.control.django'],
        [/[a-zA-Z_][\w]*/, 'variable.other.django'],
        [/%}/, 'delimiter.tag.django', '@pop'],
        [/\s+/, ''],
      ],

      templatetagArg: [
        [
          /\b(?:openblock|closeblock|openvariable|closevariable|openbrace|closebrace|opencomment|closecomment)\b/,
          'constant.language.django',
          '@pop',
        ],
        [/%}/, 'delimiter.tag.django', '@pop'],
      ],

      forLoop: [
        [/\b(?:in|reversed)\b/, 'keyword.control.django'],
        [/,/, 'punctuation.django'],
        [/[a-zA-Z_][\w]*/, 'variable.other.django'],
        [/%}/, 'delimiter.tag.django', '@pop'],
        [/\s+/, ''],
      ],

      regroupTag: [
        [/\b(?:by|as)\b/, 'keyword.control.django'],
        [/[a-zA-Z_][\w.]*/, 'variable.other.django'],
        [/%}/, 'delimiter.tag.django', '@pop'],
        [/\s+/, ''],
      ],

      cycleTag: [
        [/\b(?:as|silent)\b/, 'keyword.control.django'],
        [/'[^']*'|"[^"]*"/, 'string.django'],
        [/[a-zA-Z_][\w]*/, 'variable.other.django'],
        [/%}/, 'delimiter.tag.django', '@pop'],
        [/\s+/, ''],
      ],

      nowTag: [
        [/"[^"]*"|'[^']*'/, 'string.django'],
        [/\b(?:as)\b/, 'keyword.control.django'],
        [/[a-zA-Z_][\w]*/, 'variable.other.django'],
        [/%}/, 'delimiter.tag.django', '@pop'],
        [/\s+/, ''],
      ],

      doctype: [
        [/[^>]+/, 'metatag.content.html'],
        [/>/, 'metatag.html', '@pop'],
      ],

      htmlComment: [
        [/-->/, 'comment.html', '@pop'],
        [/[^-]+/, 'comment.content.html'],
        [/./, 'comment.content.html'],
      ],

      htmlTag: [
        [/[ \t\r\n]+/, ''],
        [
          /([\w-]+)(\s*=\s*)/,
          ['attribute.name.html', ''],
          '@htmlAttributeValue',
        ],
        [/[\w-]+/, 'attribute.name.html'],
        [/{{/, 'delimiter.variable.django', '@djangoVariableInTag'],
        [/{%/, 'delimiter.tag.django', '@djangoTagInTag'],
        [/>/, 'delimiter.html', '@pop'],
        [/\/>/, 'delimiter.html', '@pop'],
      ],

      htmlAttributeValue: [
        [/"/, 'string.html', '@htmlAttributeValueDq'],
        [/'/, 'string.html', '@htmlAttributeValueSq'],
        [/[^\s>]+/, 'string.html', '@pop'],
      ],

      htmlAttributeValueDq: [
        [/{{/, 'delimiter.variable.django', '@djangoVariableInAttr'],
        [/{%/, 'delimiter.tag.django', '@djangoTagInAttr'],
        [/[^"{]+/, 'string.html'],
        [/"/, 'string.html', '@pop'],
      ],

      htmlAttributeValueSq: [
        [/{{/, 'delimiter.variable.django', '@djangoVariableInAttr'],
        [/{%/, 'delimiter.tag.django', '@djangoTagInAttr'],
        [/[^'{]+/, 'string.html'],
        [/'/, 'string.html', '@pop'],
      ],

      djangoVariableInTag: [
        [/}}/, 'delimiter.variable.django', '@pop'],
        { include: '@expression' },
      ],

      djangoTagInTag: [
        [/%}/, 'delimiter.tag.django', '@pop'],
        { include: '@expression' },
      ],

      djangoVariableInAttr: [
        [/}}/, 'delimiter.variable.django', '@pop'],
        { include: '@expression' },
      ],

      djangoTagInAttr: [
        [/%}/, 'delimiter.tag.django', '@pop'],
        { include: '@expression' },
      ],
    },
  });
};

export interface MonacoEditorProps {
  value: string;
  onChange?(value: string);
  language?: string;
  theme?: string;
  height?: number;
  readOnly?: boolean;
}

export const MonacoEditor = ({
  value,
  onChange,
  language,
  theme = 'vs-dark',
  height,
  readOnly = false,
}: MonacoEditorProps) => {
  const [isMonacoReady, setIsMonacoReady] = useState(false);

  useEffect(() => {
    initMonaco().then((monaco) => {
      configureDjangoHTML(monaco);
      setIsMonacoReady(true);
    });
  }, []);

  if (!isMonacoReady) {
    return <LoadingSpinner />;
  }

  let editorTheme = theme;
  if (language === 'django-html') {
    editorTheme = theme === 'vs-dark' ? 'django-dark' : 'django-light';
  }

  return (
    <Editor
      height={`${height}px`}
      language={language}
      value={value || ''}
      theme={editorTheme}
      onChange={(newValue) => onChange?.(newValue || '')}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        readOnly,
        folding: true,
        foldingStrategy: 'indentation',
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
      }}
    />
  );
};
