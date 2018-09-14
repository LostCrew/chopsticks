# Chopsticks

🥢 Graphical programming language for live music coding 🎷

## Develop

```sh
yarn
yarn start
# in another tab
yarn serve
```

After you see the webpack compilation succeed (the `yarn webpack` step), open up `src/index.html` (**no server needed!**). Then modify whichever `.re` file in `src` and refresh the page to see the changes.

**For more elaborate ReasonReact examples**, please see https://github.com/reasonml-community/reason-react-example

## Build

```sh
yarn build
yarn serve:production
```

This will replace the development artifact `build/Index.js` for an optimized version.

**To enable dead code elimination**, change `bsconfig.json`'s `package-specs` `module` from `"commonjs"` to `"es6"`. Then re-run the above 2 commands. This will allow Webpack to remove unused code.
