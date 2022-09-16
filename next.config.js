module.exports = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  
};

module.exports = (phase, {defaultConfig}) => {
  if ('sassOptions' in defaultConfig) {
      defaultConfig['sassOptions'] = {
          prependData: `@import "~@styles/variables.scss";`,
      }
  }
  return defaultConfig;
}