#!/bin/bash

# Updates or creates a package with the given name (idempotent).
# The name is the directory it will be housed in.
# The name will have @agoric/ in package.json by default, if the package is
# new.
#
# Usage: scripts/repackage.sh NAME
# Example: scripts/repackage.sh console

set -ueo pipefail

DIR=$(dirname -- "${BASH_SOURCE[0]}")
cd "$DIR/.."

NAME=$1
PKGJSON=packages/$NAME/package.json

mkdir -p "packages/$NAME/"{src,dist,test}

NEWPKGJSONHASH=$(
  if [ -f "$PKGJSON" ]; then
    cat "$PKGJSON"
  else
    echo {}
  fi | jq --arg name "$NAME" '{
    name: null,
    version: null,
    description: "Description forthcoming.",
    keywords: [],
    author: "Agoric",
    license: "Apache-2.0",
    homepage: null,
    repository: null,
    bugs: null,
    type: null,
    parsers: null,
    main: null,
    module: null,
    browser: null,
    unpkg: null,
    types: null,
    exports: {},
    scripts: {},
    dependencies: {},
    devDependencies: {},
    files: [],
    publishConfig: null,
    eslintConfig: null,
    prettier: null,
    ava: null,
  } + . + {
    name: (.name // "@jessie.js/\($name)"),
    version: (.version // "0.1.0"),
    homepage: (.homepage // "https://github.com/endojs/Jessie/tree/main/packages/\($name)#readme"),
    repository: {
      type: "git",
      url: "git+https://github.com/endojs/Jessie.git",
    },
    bugs: {
      url: "https://github.com/endojs/Jessie/issues",
    },
    type: "module",
    parsers: {"js": "mjs"},
    main: "./dist/\($name).cjs",
    module: "./src/main.js",
    browser: "./dist/\($name).umd.js",
    unpkg: "./dist/\($name).umd.js",
    types: "./types/main.d.ts",
    exports: (
      if
        .exports["./package.json"]
      then
        (.exports // {}) + {
          ".": ((.exports["."] // {}) + {
            import: "./src/main.js",
            require: "./dist/\($name).cjs",
            browser: "./dist/\($name).umd.js",
          })
        }
      else
        ({
          "./package.json": "./package.json",
          ".": ((.exports // {}) + {
            import: "./src/main.js",
            require: "./dist/\($name).cjs",
            browser: "./dist/\($name).umd.js",
          })
        })
      end
    ),
    scripts: ((.scripts // {}) + {
      prepublish: "yarn clean && yarn build",
      clean: "rm -rf dist",
      build: "yarn build:types && yarn build:dist",
      "build:dist": "rollup --config rollup.config.js",
      "build:types": "tsc src/*.js --declaration --allowJs --emitDeclarationOnly --outDir types",
      test: "ava",
      cover: "nyc ava",
      lint: "eslint '"'**/*.js'"'",
      "lint-fix": "eslint --fix '"'**/*.js'"'",
    }) | to_entries | sort_by(.key) | from_entries,
    devDependencies: ((.devDependencies // {}) + {
      "@rollup/plugin-node-resolve": "^6.1.0",
      "@rollup/plugin-commonjs": "^13.0.0",
      "rollup-plugin-terser": "^5.1.3",
      "ava": "^3.12.1",
      "babel-eslint": "^10.0.3",
      "eslint": "^6.8.0",
      "nyc": "^15.1.0",
      "prettier": "^1.19.1",
      "rollup": "1.31.0",
      "rollup-plugin-terser": "^5.1.3",
      "typescript": "^4.0.5",
      "ava": "^3.12.1",
      "nyc": "^15.1.0",
    }) | to_entries | sort_by(.key) | from_entries,
    files: ((.files // []) + [
      "src",
      "dist",
      "types",
      "LICENSE*"
    ]) | sort | unique,
    "publishConfig": {
      "access": "public",
    },
    "eslintConfig": {
      "extends": [
        "@jessie.js/agoric"
      ],
      "plugins": [
        "@jessie.js"
      ]
    },
    "prettier": {
      "trailingComma": "all",
      "singleQuote": true,
    },
    "ava": {
      "files": [
        "test/**/test-*.js"
      ],
      "timeout": "2m"
    }
  }' | git hash-object -w --stdin
)

git cat-file blob "$NEWPKGJSONHASH" > "$PKGJSON"

cp template-rollup.config.js packages/"$NAME"/rollup.config.js
cp LICENSE packages/"$NAME"/LICENSE
touch packages/"$NAME"/README.md
touch packages/"$NAME"/NEWS.md
