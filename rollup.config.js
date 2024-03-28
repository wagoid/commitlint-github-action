import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import pkg from './package.json'

const bundledDeps = ['node_modules/dargs', '@commitlint', 'import-meta-resolve', 'global-directory']

export default {
  input: 'run.mjs',
  external: (depName) =>
    depName.includes('node_modules') &&
    bundledDeps.every((bundledDep) => !depName.includes(bundledDep)),
  output: [{ file: './dist/run.js', format: 'commonjs' }],
  plugins: [
    babel({
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, 'babel.config.json'),
      exclude: ['node_modules/(?!dargs)'],
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
  ],
}
