/** @type {import('postcss').Config} */
export default {
  plugins: {
    // Autoprefixer adds vendor prefixes for better browser support
    autoprefixer: {
      // Use browserslist config from .browserslistrc
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'not dead',
        'not ie 11'
      ],
      // Add flexbox prefixes for older browsers
      flexbox: 'no-2009',
      // Remove outdated prefixes
      remove: true,
      // Add support for CSS Grid
      grid: 'autoplace'
    },
  },
}
