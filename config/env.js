const fs = require('fs')
const path = require('path')

// Make sure that including paths.js after env.js will read .env variables.
// delete require.cache[require.resolve('./paths')]

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
    throw new Error(
        'The NODE_ENV environment variable is required but was not specified.'
    )
}

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebook/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of webpack shims.
// https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd())

process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .concat([
        path.resolve(appDirectory, 'node_modules'),
        'node_modules',
    ])
    .join(path.delimiter)

console.log(process.env.NODE_PATH)
