const HtmlWebPackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: ['babel-loader'],
            },
            {
                test: /.less$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader' },
                ]
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: ['html-loader'],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './template/index.html',
            filename: './index.html',
        }),
        new NodePolyfillPlugin(),
    ],
};
