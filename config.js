import chalk from 'chalk'
import pkg from './package.json'

export const envProduction = process.env.NODE_ENV === 'production'

console.log([
  '-------------------------------------',
  '',
  ` Theme: ${chalk.bold.green(pkg.name)} v${pkg.version}`,
  ` Env:   ${chalk.blue(envProduction ? 'Production' : 'Develop')}`,
  '',
  '-------------------------------------'
].join('\n'))

const config = {
  dirs: {
    src: './src',
    dest: `./dest`,
    svgpack: './svgpack',
    styleguide: './styleguide'
  }
}

export default config
