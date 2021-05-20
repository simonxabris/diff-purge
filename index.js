#!/usr/bin/env node

// @ts-check
const sade = require("sade");
const { readdirSync, statSync, unlinkSync, rmSync } = require("fs");
const path = require("path");

const DIFF_OUTPUT_FOLDER_NAME = "__diff_output__";
const IGNORED_DIRS = ["node_modules", ".git"];

const prog = sade("diff-purge [dir]", true).option(
  "-d, --diff-only",
  "Only delete the found __diff_output__ folders, but not the actual snapshots"
);

prog.action((dir) => {
  main(dir);
});

prog.parse(process.argv);

/**
 *
 * @param {string} dir
 */
function main(dir) {
  const basedir = dir ? path.join(process.cwd(), dir) : process.cwd();
  const dirs = findDirsWithDiffOutput(basedir);

  if (dirs.length === 0) {
    console.log("No diff output found");
    process.exit(0);
  }

  for (const dirToDelete of dirs) {
    deleteFoundDiffs(dirToDelete);
  }
}

/**
 *
 * @param {string} basedir
 *
 * @returns {Array<string>}
 */
function findDirsWithDiffOutput(basedir) {
  const directoriesFound = [];

  const dirContents = readdirSync(basedir);

  for (const name of dirContents) {
    const stats = statSync(path.join(basedir, name));

    if (name === DIFF_OUTPUT_FOLDER_NAME && stats.isDirectory()) {
      directoriesFound.push(basedir);
      continue;
    }

    if (stats.isDirectory() && !IGNORED_DIRS.includes(name)) {
      const foundDirs = findDirsWithDiffOutput(path.join(basedir, name));
      directoriesFound.push(...foundDirs);
    }
  }

  return directoriesFound;
}

/**
 *
 * @param {string} dirname
 */
function deleteFoundDiffs(dirname) {
  const diffNames = readdirSync(path.join(dirname, DIFF_OUTPUT_FOLDER_NAME));

  const normalizedDiffNames = diffNames.map((name) => name.split(".")[0]);

  for (const name of normalizedDiffNames) {
    console.log(`Deletig file: ${path.join(dirname, name)}`);
    unlinkSync(path.join(dirname, `${name}.snap.png`));
  }

  rmSync(path.join(dirname, DIFF_OUTPUT_FOLDER_NAME), { recursive: true });
}
