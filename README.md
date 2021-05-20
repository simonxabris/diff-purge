# diff-purge CLI

This is a little CLI tool that deletes the failing snapshots from your project based on the `__diff_output__` folders in your project.

_Caution_: Always check whether the diffs signal an actual failure in your application before deleting the corresponding snapshots and updating them!

## Usage

```sh
npx diff-purge <directory> [-d | --diff-only]
```

diff-purge will start to look for `__diff_output__` folders recursively either from where you ran the command from or you can specify the start point by supplying a path to a directory (relative to the current working directory).

When it finds a `__diff_output__` folder it will look at its contents and delete the corresponding snapshots automatically. It will also remove the `__diff_output__` directory itself.

Run `npx diff-purge --help` for usage info.

### Flags

- `-d | --diff-only`: If this flag is provided, it will only delete the `__diff_output__` directories it finds, but not the actual snapshot files.
