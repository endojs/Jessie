// @ts-check
/// <reference path="./peg.d.ts"/>
/**
 * @template T
 * @param {IParserTag<T>} tag
 * @param {string} [uri]
 */
const tagString = (tag, uri) => {
  /**
   * @type {(template: TemplateStringsArray, ...args: Array<unknown>) => T}
   */
  const tagged = (template, ...args) => {
    const cooked = template.reduce((prior, t, i) => {
      prior.push(t, String(args[i]));
      return prior;
    }, []);
    cooked.push(template[template.length - 1]);
    const cooked0 = cooked.join('');
    const raw0 = args
      .reduce(
        (prior, hole, i) => {
          prior.push(String(hole), template.raw[i + 1]);
          return prior;
        },
        [template.raw[0]],
      )
      .join('');
    const sources0 = {
      byte: 0,
      column: 1,
      line: 1,
      uri,
    };
    const tmpl = Object.assign([cooked0], { raw: [raw0], sources: [sources0] });
    return tag(tmpl);
  };
  return Object.assign(tagged, {
    parserCreator: tag.parserCreator,
    // eslint-disable-next-line no-underscore-dangle
    _asExtending: tag._asExtending,
    /**
     * @param {Partial<ParserOptions>} opts
     */
    options: opts => tagString(tag.options(opts), uri),
  });
};

export default tagString;
