const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.coffee',
  output: {
    filename: 'main.js'
  },
  module: {
    rules: [
      { test: /\.js$/            , use: 'babel-loader'    },
      { test: /\.pug$/           , use: 'pug-plain-loader'},
      { test: /\.coffee$/        , use: 'coffee-loader'   },
      { test: /\.(png|jpg|gif)$/i, use: 'url-loader'      },
      { test: /\.css$/           , use: [MiniCssExtractPlugin.loader, 'css-loader']},
      { test: /\.styl$/          , use: [MiniCssExtractPlugin.loader, 'css-loader','stylus-loader'] },
    ]
  },

  plugins: [
    // Копируем библиотеки
    new CopyPlugin({
      patterns: [
        {from: "manifest.json"},
        {from: "img/favicon.png"},
      ]
    })
  ]
};
