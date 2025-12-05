/**
 * @file Block definitions for Jessie full language.
 * @see {jessieBlocks}
 */

export const jessieBlocks = [
  {
    type: 'jessie_const',
    message0: 'const %1 = %2',
    args0: [
      {
        type: 'field_input',
        name: 'VAR',
        text: 'x',
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 330,
    tooltip: 'Declare a constant',
  },
  {
    type: 'jessie_const_destructure',
    message0: 'const { %1 } = %2',
    args0: [
      {
        type: 'field_input',
        name: 'PROPS',
        text: 'x, y',
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 330,
    tooltip: 'Declare constants with object destructuring',
  },
  {
    type: 'jessie_const_array_destructure',
    message0: 'const [ %1 ] = %2',
    args0: [
      {
        type: 'field_input',
        name: 'ITEMS',
        text: 'x, y',
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 330,
    tooltip: 'Declare constants with array destructuring',
  },
  {
    type: 'jessie_let',
    message0: 'let %1 = %2',
    args0: [
      {
        type: 'field_input',
        name: 'VAR',
        text: 'x',
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 330,
    tooltip: 'Declare a variable',
  },
  {
    type: 'jessie_assign',
    message0: '%1 = %2',
    args0: [
      {
        type: 'field_input',
        name: 'VAR',
        text: 'x',
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 330,
    tooltip: 'Assign to variable',
  },
  {
    type: 'jessie_function',
    message0: 'function %1 ( %2 ) %3',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'myFunction',
      },
      {
        type: 'field_input',
        name: 'PARAMS',
        text: 'x, y',
      },
      {
        type: 'input_statement',
        name: 'BODY',
        check: 'Statement',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 290,
    tooltip: 'Function declaration',
  },
  {
    type: 'jessie_arrow',
    message0: '( %1 ) => %2',
    args0: [
      {
        type: 'field_input',
        name: 'PARAMS',
        text: 'x',
      },
      {
        type: 'input_value',
        name: 'EXPR',
        check: 'Value',
      },
    ],
    output: 'Value',
    colour: 290,
    tooltip: 'Arrow function expression',
  },
  {
    type: 'jessie_return',
    message0: 'return %1',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Statement',
    colour: 290,
    tooltip: 'Return statement',
  },
  {
    type: 'jessie_if',
    message0: 'if ( %1 ) %2',
    args0: [
      {
        type: 'input_value',
        name: 'CONDITION',
        check: 'Value',
      },
      {
        type: 'input_statement',
        name: 'THEN',
        check: 'Statement',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 210,
    tooltip: 'If statement',
  },
  {
    type: 'jessie_if_else',
    message0: 'if ( %1 ) %2 else %3',
    args0: [
      {
        type: 'input_value',
        name: 'CONDITION',
        check: 'Value',
      },
      {
        type: 'input_statement',
        name: 'THEN',
        check: 'Statement',
      },
      {
        type: 'input_statement',
        name: 'ELSE',
        check: 'Statement',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 210,
    tooltip: 'If-else statement',
  },
  {
    type: 'jessie_for',
    message0: 'for ( %1 of %2 ) %3',
    args0: [
      {
        type: 'field_input',
        name: 'VAR',
        text: 'item',
      },
      {
        type: 'input_value',
        name: 'ITERABLE',
        check: 'Value',
      },
      {
        type: 'input_statement',
        name: 'BODY',
        check: 'Statement',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 120,
    tooltip: 'For-of loop',
  },
  {
    type: 'jessie_while',
    message0: 'while ( %1 ) %2',
    args0: [
      {
        type: 'input_value',
        name: 'CONDITION',
        check: 'Value',
      },
      {
        type: 'input_statement',
        name: 'BODY',
        check: 'Statement',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 120,
    tooltip: 'While loop',
  },
  {
    type: 'jessie_break',
    message0: 'break',
    previousStatement: 'Statement',
    colour: 120,
    tooltip: 'Break statement',
  },
  {
    type: 'jessie_continue',
    message0: 'continue',
    previousStatement: 'Statement',
    colour: 120,
    tooltip: 'Continue statement',
  },
  {
    type: 'jessie_throw',
    message0: 'throw %1',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    previousStatement: 'Statement',
    colour: 0,
    tooltip: 'Throw statement',
  },
  {
    type: 'jessie_try_catch',
    message0: 'try %1 catch ( %2 ) %3',
    args0: [
      {
        type: 'input_statement',
        name: 'TRY',
        check: 'Statement',
      },
      {
        type: 'field_input',
        name: 'ERROR',
        text: 'e',
      },
      {
        type: 'input_statement',
        name: 'CATCH',
        check: 'Statement',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 0,
    tooltip: 'Try-catch statement',
  },
  {
    type: 'jessie_harden',
    message0: 'harden ( %1 )',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Value',
      },
    ],
    inputsInline: true,
    output: 'Value',
    colour: 0,
    tooltip: 'Harden (freeze) an object',
  },
  {
    type: 'jessie_export',
    message0: 'export %1',
    args0: [
      {
        type: 'input_statement',
        name: 'EXPORTS',
        check: 'ExportItem',
      },
    ],
    colour: 160,
    tooltip: 'Export declaration',
  },
  {
    type: 'jessie_export_item',
    message0: '%1',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'myFunction',
      },
    ],
    previousStatement: 'ExportItem',
    nextStatement: 'ExportItem',
    colour: 160,
    tooltip: 'Export item',
  },
  {
    type: 'jessie_import',
    message0: 'import %1 from %2',
    args0: [
      {
        type: 'input_statement',
        name: 'IMPORTS',
        check: 'ImportItem',
      },
      {
        type: 'field_input',
        name: 'MODULE',
        text: './module.js',
      },
    ],
    previousStatement: 'Statement',
    nextStatement: 'Statement',
    colour: 160,
    tooltip: 'Import from module',
  },
  {
    type: 'jessie_import_item',
    message0: '%1',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'myFunction',
      },
    ],
    previousStatement: 'ImportItem',
    nextStatement: 'ImportItem',
    colour: 160,
    tooltip: 'Named import',
  },
  {
    type: 'jessie_import_as',
    message0: '%1 as %2',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'originalName',
      },
      {
        type: 'field_input',
        name: 'ALIAS',
        text: 'newName',
      },
    ],
    previousStatement: 'ImportItem',
    nextStatement: 'ImportItem',
    colour: 160,
    tooltip: 'Import with alias',
  },
  {
    type: 'jessie_import_star',
    message0: '* as %1',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'module',
      },
    ],
    previousStatement: 'ImportItem',
    colour: 160,
    tooltip: 'Import everything as namespace',
  },
];
