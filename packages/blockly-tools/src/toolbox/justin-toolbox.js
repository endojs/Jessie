/**
 * @file Toolbox configuration for Justin blocks.
 * @see {justinToolbox}
 */

export const justinToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Values',
      colour: '210',
      contents: [
        { kind: 'block', type: 'json_null' },
        { kind: 'block', type: 'json_boolean' },
        { kind: 'block', type: 'json_number' },
        { kind: 'block', type: 'json_string' },
        { kind: 'block', type: 'justin_undefined' },
        { kind: 'block', type: 'justin_nan' },
        { kind: 'block', type: 'justin_infinity' },
        { kind: 'block', type: 'justin_bigint' },
        { kind: 'block', type: 'justin_template_literal' },
      ],
    },
    {
      kind: 'category',
      name: 'Template Literals',
      colour: '210',
      contents: [
        { kind: 'block', type: 'justin_template_with_holes' },
        { kind: 'block', type: 'justin_template_text' },
        { kind: 'block', type: 'justin_template_expr' },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: '330',
      contents: [{ kind: 'block', type: 'justin_variable' }],
    },
    {
      kind: 'category',
      name: 'Operators',
      colour: '160',
      contents: [
        { kind: 'block', type: 'justin_binary_op' },
        { kind: 'block', type: 'justin_unary_op' },
        { kind: 'block', type: 'justin_ternary' },
      ],
    },
    {
      kind: 'category',
      name: 'Arrays',
      colour: '260',
      contents: [
        { kind: 'block', type: 'json_array' },
        { kind: 'block', type: 'json_array_element' },
      ],
    },
    {
      kind: 'category',
      name: 'Objects',
      colour: '290',
      contents: [
        { kind: 'block', type: 'json_object' },
        { kind: 'block', type: 'json_property' },
        { kind: 'block', type: 'justin_member' },
        { kind: 'block', type: 'justin_index' },
      ],
    },
    {
      kind: 'category',
      name: 'Functions',
      colour: '290',
      contents: [
        { kind: 'block', type: 'justin_call' },
        { kind: 'block', type: 'justin_argument' },
      ],
    },
  ],
};
