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

function isDirectory(filePath: string) {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
}

function shouldTest(filePath: string, options?: SnapshotOptions) {
  if (isFile(filePath)) {
    // check if the file has the ignored extension
    if (options?.ignoreExtensions) {
      for (const extension of options.ignoreExtensions) {
        if (filePath.endsWith(extension)) {
          return false;
        }
      }
    }

    // check if the file has the correct extension
    if (options?.extensions) {
      for (const extension of options.extensions) {
        if (filePath.endsWith(extension)) {
          return true;
        }
      }
      return false;
    }
  }
  return true;
}

function findTestableFiles(
  directory: string,
  options?: SnapshotOptions
): string[] {
  const stack: string[] = [directory];
  const files: string[] = [];

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

  while (stack.length > 0) {
    const currentDir = stack.pop() as string;
    const entries = fs.readdirSync(currentDir);

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry);
      if (isDirectory(entryPath)) {
        stack.push(entryPath);
      } else if (shouldTest(entryPath, options)) {
        files.push(entryPath);
      }
    }
  }

  if (files.length === 0) {
    console.error("No testable files found.");
    process.exit(1);
  }

  return files;
}

function runSnapshotTestForPaths(testableFileObjects: TestableFileObject[]) {
  testableFileObjects.forEach((testableFileObject) => {
    runSnapshot(testableFileObject);
  });
}

export function easySnapshot(dirPath: string, options?: SnapshotOptions) {
  const currentDir = require.main?.path || process.cwd();
  const targetDir = path.join(currentDir, dirPath);

  const testableFiles = findTestableFiles(targetDir, options);
  const testableFileObjects = testableFiles.map((filePath) => {
    return { relative: path.relative(targetDir, filePath), absolute: filePath };
  });

  runSnapshotTestForPaths(testableFileObjects);
}

interface TestableFileObject {
  relative: string;
  absolute: string;
}

interface SnapshotOptions {
  extensions?: string[];
  ignoreExtensions?: string[];
}
