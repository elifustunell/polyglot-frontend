// webpack.config.js (root directory'de)
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Custom config ekleyebilirsiniz
  return config;
};
