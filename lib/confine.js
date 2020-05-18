import harden from '@agoric/harden';

let _sourceURLLength = -1;

export const $h_sourceURLLength = harden((len) => _sourceURLLength = len);

const dataSource = (src) => {
    if (_sourceURLLength >= 0) {
        if (src.length > _sourceURLLength) {
            src = src.slice(0, _sourceURLLength) + '...';
        }
        else {
            src = src.slice(0, _sourceURLLength);
        }
    }
    return `data:${encodeURIComponent(src)}`;
};

/**
 * The faux version of SES's <tt>confineExpr</tt> evals an
 * expression in an environment consisting of the global environment
 * as enhanced and shadowed by the own properties of the
 * <tt>env</tt> object. Unlike real <tt>confineExpr</tt>, <ul>
 * <li>The faux <tt>confineExpr</tt> does not have a third
 *     <tt>opt_options</tt> parameter. An options argument can of
 *     course be provided by the caller, but it will be ignored.
 * <li>The expression can be in the subset of ES6 supported by
 *     Babel.
 * <li>All dangerous globals that are not shadowed, such as "window"
 *     or "document", are still accessible by the evaled expression.
 * <li>The current binding of these properties at the time that
 *     <tt>confineExpr</tt> is called are used as the initial
 *     bindings. Further changes to either the properties or the
 *     bindings are not tracked by the other.
 * <li>In the evaled expression, <tt>this</tt> is bound to
 *     <tt>undefined</tt>.
 * </ul>
 */
export const confineExpr = harden((exprSrc, env) => {
    exprSrc = '' + exprSrc;
    const names = Object.getOwnPropertyNames(env);
    // Note: no newline prior to ${exprSrc}, so that line numbers for
    // errors within exprSrc are accurate. Column numbers on the first
    // line won't be, but will on following lines.
    const closedFuncSrc = `(function(${names.join(',')}) { "use strict"; return (${exprSrc}
  );
  })
  //# sourceURL=${dataSource(exprSrc)}
  `;
    const closedFunc = (1, eval)(closedFuncSrc);
    return closedFunc(...names.map(n => env[n]));
});

/**
 * The faux version of confine is similar to confineExpr, but is for
 * statements.  It returns undefined (or throws).
 */
export const confine = harden((src, env) => {
    src = '' + src;
    const names = Object.getOwnPropertyNames(env);
    // Note: no newline prior to ${src}, so that line numbers for
    // errors within src are accurate. Column numbers on the first
    // line won't be, but will on following lines.
    const closedFuncSrc = `(function(${names.join(',')}) { "use strict"; ${src}
  ;
  })
  //# sourceURL=${dataSource(src)}
  `;
    const closedFunc = (1, eval)(closedFuncSrc);
    closedFunc(...names.map(n => env[n]));
    // We return nothing.
});
