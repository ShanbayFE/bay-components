const webpack = require('webpack');
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const buildPath = path.join(__dirname, 'dist/');

const commonConfig = {
    entry: {
        'bay-components': './src/js/index',
        'bay-components.min': './src/js/index',
    },
    output: {
        path: buildPath,
        filename: '[name].js',
        library: 'bayComponents',
        libraryTarget: 'var',
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['babel'],
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('css!postcss!less'),
        },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(['./dist']),
        new ExtractTextPlugin('[name].css'),
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            compress: {
                warnings: false,
            },
        }),
    ],
};

module.exports = commonConfig;
