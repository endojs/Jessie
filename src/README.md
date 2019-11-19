# Jessie Parser

There are currently no canonical sources for parsing and evaluating Jessie, but Agoric's experimental `jessica` project has the most complete (though still not fully complete) implementation.

## Running on the web

To use it without installing, you can visit: https://jessica.agoric.com/jessie-frame/

## Running locally

If you want clone: https://github.com/agoric-labs/jessica

You will need a recent Node.js installation for your platform.

Then to parse an arbitrary Jessie module, run:

```sh
./jessica/lang/nodejs/jessparse.bat PATH-TO-JESSIE-MODULE.js > myout.json
```

[Don't be fooled by the `.bat` suffix, it runs better on Unix-like platforms.]

it will grind for a bit, then produce a JSON AST or parse error.

Raise an issue on the jessica repository if you have problems.

Good luck!
