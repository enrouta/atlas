# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets)
— it drives per-package versioning and changelogs.

When you change a package, add a changeset:

    pnpm changeset

Pick the affected packages and the bump type (patch / minor / major) and write a
one-line summary. Commit the generated file with your PR.

On merge to `main`, a bot opens a **Version Packages** PR that applies the bumps
and updates changelogs. Merging that PR publishes the updated `@enrouta/*`
packages to npm.
