import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import pkg from './package.json'

export default {
  input: 'run.js',
  external: (depName) =>
    depName.includes('node_modules') && !depName.includes('node_modules/dargs'),
  output: [{ file: pkg.main, format: 'cjs' }],
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
  ],
}
