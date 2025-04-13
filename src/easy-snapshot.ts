import path from "path";
import fs from "fs";

function checkSnapshot(testableFileObject: TestableFileObject) {
  describe(testableFileObject.relative + " Snapshot", () => {
    it("should match the saved snapshot", () => {
      const htmlContent = fs.readFileSync(testableFileObject.absolute, "utf8");

      expect(htmlContent).toMatchSnapshot();
    });
  });
}

function isTestableFile(filePath: string) {
  const isFile = fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
  if (isFile) {
    return path.extname(filePath).toLowerCase() === ".html";
  }
  return false;
}

function findTestableFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory);

  const testableFiles = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry);

    if (fs.existsSync(entryPath) && fs.lstatSync(entryPath).isDirectory()) {
      testableFiles.push(...findTestableFiles(entryPath));
    } else if (isTestableFile(entryPath)) {
      testableFiles.push(entryPath);
    }
  }
  return testableFiles;
}

function checkSnapshotTestForPaths(testableFileObjects: TestableFileObject[]) {
  testableFileObjects.forEach((testableFileObject) => {
    checkSnapshot(testableFileObject);
  });
}

export function easySnapshot(dirPath: string) {
  const targetDir = path.join(__dirname, dirPath);

  console.log("path received: ", dirPath);

  const testableFiles = findTestableFiles(targetDir);

  if (testableFiles.length === 0) {
    console.error("No files found in the directory.");
    return;
  }

  const testableFileObjects = testableFiles.map((filePath) => {
    return { relative: path.relative(targetDir, filePath), absolute: filePath };
  });

  checkSnapshotTestForPaths(testableFileObjects);
}

interface TestableFileObject {
  relative: string;
  absolute: string;
}
