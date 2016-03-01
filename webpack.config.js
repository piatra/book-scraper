module.exports = {
  cache: true,
  entry: './public/js/app.jsx',
  output: {
    filename: './public/js/browser-bundle.js'
  },
  module: {
    loaders: [
      {test: /(\.js$)|(\.jsx$)/, loader: 'jsx-loader'}
    ]
  }
};
