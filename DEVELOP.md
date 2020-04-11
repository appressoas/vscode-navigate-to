# How to develop this extension

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