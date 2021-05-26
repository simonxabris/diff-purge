#!/usr/bin/env node

// @ts-check
import sade from "sade";
import { readdirSync, statSync, unlinkSync, rmSync } from "fs";
import { join } from "path";
import kleur from "kleur";

const DIFF_OUTPUT_FOLDER_NAME = "__diff_output__";
const IGNORED_DIRS = ["node_modules", ".git"];

const prog = sade("diff-purge [dir]", true).option(
  "-d, --diff-only",
  "Only delete the found __diff_output__ folders, but not the actual snapshots"
);

prog.action((dir, opts) => {
  main(dir, opts);
});

prog.parse(process.argv);

/**
 *
 * @param {string} dir
 * @param {Record<string, boolean>} opts
 */
function main(dir, opts) {
  const diffOnlyFlag = opts["diff-only"];

  const basedir = dir ? join(process.cwd(), dir) : process.cwd();
  const dirs = findDirsWithDiffOutput(basedir);

  if (dirs.length === 0) {
    console.log("No diff output found");
    process.exit(0);
  }

  for (const dirToDelete of dirs) {
    if (diffOnlyFlag === true) {
      deleteDiffOutputDirectory(dirToDelete);
    } else {
      deleteFoundDiffs(dirToDelete);
    }
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
    const stats = statSync(join(basedir, name));

    if (name === DIFF_OUTPUT_FOLDER_NAME && stats.isDirectory()) {
      directoriesFound.push(basedir);
      continue;
    }

    if (stats.isDirectory() && !IGNORED_DIRS.includes(name)) {
      const foundDirs = findDirsWithDiffOutput(join(basedir, name));
      directoriesFound.push(...foundDirs);
    }
  }

  return directoriesFound;
}

/**
 *
 * @param {string} testDirectoryPath
 */
function deleteFoundDiffs(testDirectoryPath) {
  const diffNames = readdirSync(
    join(testDirectoryPath, DIFF_OUTPUT_FOLDER_NAME)
  );

  const normalizedDiffNames = diffNames.map((name) => name.split(".")[0]);

  console.log(
    kleur.underline(
      `Deleting the following files from ${kleur.bold(`${testDirectoryPath}`)}:`
    )
  );

  for (const name of normalizedDiffNames) {
    console.log(kleur.bold(`  • ${name}.snap.png`));
    unlinkSync(join(testDirectoryPath, `${name}.snap.png`));
  }

  console.log("\r\n");

  rmSync(join(testDirectoryPath, DIFF_OUTPUT_FOLDER_NAME), {
    recursive: true,
  });
}

/**
 *
 * @param {string} directory
 */
function deleteDiffOutputDirectory(directory) {
  rmSync(join(directory, DIFF_OUTPUT_FOLDER_NAME), {
    recursive: true,
  });

  console.log(`Deleted __diff_output__ from ${directory}`);
}
