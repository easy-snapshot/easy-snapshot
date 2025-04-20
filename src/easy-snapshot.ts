import path from "path";
import fs from "fs";
import { describe, expect, it } from "@jest/globals";

function runSnapshot(testableFileObject: TestableFileObject) {
  describe(testableFileObject.relative + " Snapshot", () => {
    it("should match the saved snapshot", () => {
      const content = fs.readFileSync(testableFileObject.absolute, "utf8");

      expect(content).toMatchSnapshot();
    });
  });
}

function isFile(filePath: string) {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
}

function shouldTest(filePath: string) {
  if (isFile(filePath)) {
    return path.extname(filePath).toLowerCase() === ".html";
  }
  return false;
}

function findSubdirectories(directory: string): string[] {
  const subdirectories: string[] = [];
  const stack: string[] = [directory];

  while (stack.length > 0) {
    const currentDir = stack.pop() as string;
    const entries = fs.readdirSync(currentDir);

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry);
      if (isDirectory(entryPath)) {
        subdirectories.push(entryPath);
        stack.push(entryPath);
      }
    }
  }

  return subdirectories;
}

function isDirectory(filePath: string) {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
}

function findTestableFiles(directories: string[]): string[] {
  const testableFiles: string[] = [];
  for (const directory of directories) {
    if (!fs.existsSync(directory)) {
      console.error(
        "We could not find anything to test using the following path: " +
          directory
      );
      process.exit(1);
    }

    // if this is the path to a file, return it
    if (isFile(directory)) {
      return [directory];
    }

    const entries = fs.readdirSync(directory);

    for (const entry of entries) {
      const entryPath = path.join(directory, entry);

      if (shouldTest(entryPath)) {
        testableFiles.push(entryPath);
      }
    }
  }

  // if no testable files were found, exit with an error
  if (testableFiles.length === 0) {
    console.error("No testable files found.");
    process.exit(1);
  }

  return testableFiles;
}

function runSnapshotTestForPaths(testableFileObjects: TestableFileObject[]) {
  testableFileObjects.forEach((testableFileObject) => {
    runSnapshot(testableFileObject);
  });
}

export function easySnapshot(dirPath: string) {
  const currentDir = require.main?.path || process.cwd();
  const targetDir = path.join(currentDir, dirPath);

  console.log("absolute path received: ", dirPath);

  const testableDirs = findSubdirectories(targetDir);
  testableDirs.push(targetDir);

  const testableFiles = findTestableFiles(testableDirs);

  const testableFileObjects = testableFiles.map((filePath) => {
    return { relative: path.relative(targetDir, filePath), absolute: filePath };
  });

  runSnapshotTestForPaths(testableFileObjects);
}

interface TestableFileObject {
  relative: string;
  absolute: string;
}
