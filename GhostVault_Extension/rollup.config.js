import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'background.js',
  output: {
    file: 'background.bundle.js',
    format: 'es',
  },
  plugins: [resolve(), commonjs()],
  external: ['chrome']
}; 