var webpack = require('webpack');

module.exports = {
    options: {
        entry: './app/scripts/index.js',
        output: {
            path: __dirname + '/app/static/js',
            filename: 'bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'ng-annotate!babel',
                    exclude: /node_modules/
                },
                {
                    test: /\.html$/,
                    loader: 'html'
                },
            ]
        }
    },
    dev: {
        watch: true,
        keepalive: true,
        failOnError: false,
        devtool: 'source-map',
        debug: true
    },
    prod: {
        plugins: [
            new webpack.optimize.DedupePlugin()
        ]
    }
};
