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

function findTestableFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    console.error(
      "We could not find any directory using the following path: " + directory
    );
    process.exit(1);
  }

  // if this is the path to a file, return it
  if (isFile(directory)) {
    return [directory];
  }

  const entries = fs.readdirSync(directory);

  const testableFiles = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry);

    if (fs.existsSync(entryPath) && fs.lstatSync(entryPath).isDirectory()) {
      testableFiles.push(...findTestableFiles(entryPath));
    } else if (shouldTest(entryPath)) {
      testableFiles.push(entryPath);
    }
  }

  // if no testable files were found, exit with an error
  if (testableFiles.length === 0) {
    console.error(
      "No files found in directory " + directory + " or its subdirectories"
    );
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
  const targetDir = path.join(__dirname, dirPath);

  console.log("path received: ", dirPath);

  const testableFiles = findTestableFiles(targetDir);

  const testableFileObjects = testableFiles.map((filePath) => {
    return { relative: path.relative(targetDir, filePath), absolute: filePath };
  });

  runSnapshotTestForPaths(testableFileObjects);
}

interface TestableFileObject {
  relative: string;
  absolute: string;
}
