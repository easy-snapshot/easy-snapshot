# easy-snapshot

Get started with snapshot testing in an instant!
The easiest way to start testing legacy projects!
Upgrade dependencies and see any changes in your project's artifacts!

# Our famous 3-step program:

- Call a command that generates artifacts
- Give easy-snapshot the path where these artifacts are created
- You can now start refactoring, your tests will let you know if your changes have an impact on your artifacts.

# Requirements:

npm

# Detailed how-to:

0. If your project is not an npm project, you need to make it one:

```sh
npm init -y # the -y flag will create your package.json using default values.
```

- Edit your package.json so that the test script is jest `"test": "jest"` like so:

```json
{
  "name": "my-cool-package-name",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}
```

1. Install the easy-snapshot package with npm:

```sh
npm install --save-dev easy-snapshot
```

2. Create a test file "snapshot.test.js" and pass the path to the artifacts you want to check:

```js
// By default jest will run all test files that end with .test.js.

const { easySnapshot } = require("easy-snapshot");

describe("Snapshot Tests", () => {
  easySnapshot("path/to/the/directory/where/your/project/creates/artifacts");
});
```

3. Run you project to generate the artifacts.

4. Create your snapshots by running:

```sh
npm run test -- --updateSnapshot
```

5. Make changes to your project

6. Anytime you want to check that your changes have not broken anything, re-generate your artifacts and run:

```sh
npm run test
```

7. Remember to update your snapshots anytime you expect the output of your artifact to have changed. To re-create your snapshots, run:

```sh
npm run test -- --updateSnapshot
```
