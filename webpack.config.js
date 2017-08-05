const path = require('path');
const webpack = require('webpack');
//look into https://github.com/orange-games/phaser-input/issues/7
module.exports = {
    entry: './js/main.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.bundle.js'
    },
    module: {
        /*rules: [
         { test:/phaser\-input\.min\.js$/},
         { test:/phaser\.js$/}
         ],*/
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};