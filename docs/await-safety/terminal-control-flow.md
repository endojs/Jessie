This nested await is safe because "terminal-control-flow",
given that we do not consider the timing of a `console.log`
to be a practical hazard.

A joined control flow (e.g. if/then/else) with an await is a hazard if there is additional code after the block.

This case names when it's safe because there is no code after or it's a return.
