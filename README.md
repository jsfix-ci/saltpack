# saltpack

## Exports

This library has two exports, `Encrypt` and `Decrypt`.

## How to release

CI automatically publishes to npm if it notices that the version has bumped on
the main branch.

The easiest way to bump the version is by running `npm version minor`.

Push/merge to main and then CI will pick it up.
