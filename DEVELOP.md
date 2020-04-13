# How to develop this extension

## Consider using vscode insiders
VSCode insiders is a daily "unstable" build of vscode. It is nice to use for extension development because:

- It is a separate app. You can install both insiders and normal vscode.
- It does not have any extensions enabled by default, and when you are using the extension
  from the marketplace and developing it you have to keep disabling it to use the
  "development" version.
- You can prepare for new features.


## Same nodejs version as VSCode
Make sure you have the same nodejs version as your VSCode has.
See `Help: About` in the command palette to find your nodejs version and electron version.

Then use `nvm install <nodejs-version>` and `nvm use <nodejs-version>` 
to get the same nodejs version as your vscode.

Modify the electron version in `package.json` to match the electron version
VSCode is using (just do not commit this).

Then run:
```
$ yarn
$ yarn electron-rebuild
```
to install and rebuild modules with the correct electron and nodejs version.

If you still get `NODE_MODULE_VERSION mismatch` errors, try to remove
`node_modules/` and start over, ensure your versions match perfectly with
VSCode.


## Running tests
- Go to the debugging pane (in the left side vertical icon bar).
- In the run menu at the top, select `Extension tests` from the dropdown.
- Click the play icon, or run the `Debug: Start debugging` command palette action. When writing tests, the command palette action is probably the most efficient method (for re-running the tests).
- The console output from the extension ends up in the _Debug console_ (select _Extension tests_ in the dropdown).

## Running the extension
- Go to the debugging pane (in the left side vertical icon bar).
- In the run menu at the top, select `Run extension` from the dropdown.
- Click the play icon, or run the `Debug: Start debugging` command palette action.
    - This will open a new window with the project/workspace folder in the `test-workspace/` directory as the "root".
    - You can open other directories or workspaces as normal (to test it out with real world projects).
- If you change code, you can use the _reload_ icon in the debugging bar in the "main" window (not the extension debugging window) to reload the extension
  with the new code.
- The console output from the extension ends up in the _Debug console_ (select _Run extension_ in the select).