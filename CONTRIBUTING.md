Rough notes that should evolve into a better guide sometime.

## Publishing a release

```sh
# Name a release branch
now=`date -u +%Y%m%dT%H%M%S`
git checkout -b prepare-release-$now
git branch -u origin

# Install build dependencies
yarn install --force

# Bump versions for changed packages
yarn lerna version --conventional-graduate

# Push and create a release PR
git push
open https://github.com/endojs/Jessie/pulls
```

Get approval and wait for CI to pass.

```sh
# Build release artifacts.
yarn build

# Publish to NPM. NOTE: You may have to repeat this several times if there are failures.
# without concurrency until https://github.com/Agoric/agoric-sdk/issues/8091
yarn lerna publish --concurrency 1 from-package
```

Merge the release PR into the base branch.

**DO NOT REBASE OR SQUASH OR YOU WILL LOSE REFERENCES TO YOUR TAGS.**

You may use the GitHub "Merge" button directly instead of automerge.
