module.exports = {
  cache: true,
  entry: './public/app.jsx',
  output: {
    filename: './public/browser-bundle.js'
  },
  module: {
    loaders: [
      {test: /(\.js$)|(\.jsx$)/, loader: 'jsx-loader'}
    ]
  }
};
