/* eslint-env node */
const path = require('path')

const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const autoprefixer = require('autoprefixer')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { ProvidePlugin } = require('webpack')
const globImporter = require('node-sass-glob-importer')
const { DuplicatesPlugin } = require('inspectpack/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackAssetsManifest = require('webpack-assets-manifest')

const babelConfig = require('./babel.config.frontend')

const ROOT_DIR = path.resolve(__dirname)
const SRC_DIR = path.join(ROOT_DIR, 'src')

const defaultOptions = {
    staticFiles: [],
    includeDirs: [
        SRC_DIR,
        path.join(ROOT_DIR, 'fonts'),
    ],
}

module.exports = (
    env,
    options = defaultOptions,
) => {
    const config = {
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 9000,
        },

        watch: true,

        mode: env || 'development',

        entry: {
            typescript: path.join(SRC_DIR, 'typescript.tsx'),
            javascript: path.join(SRC_DIR, 'javascript.js'),
            sass: path.join(SRC_DIR, 'styles.scss'),
            svg: path.join(SRC_DIR, 'image.svg'),
        },

        output: {
            filename: '[name].bundle.[contenthash].js',
            path: path.join(ROOT_DIR, 'dist'),
            publicPath: '',
        },

        resolve: {
            modules: [
                path.join(ROOT_DIR, 'node_modules'),
            ],
            extensions: [
                '.ts',
                '.tsx',
                '.js',
                '.json',
                '.jsx',
            ],
            alias: {
                vue$: 'vue/dist/vue.esm.js',
            },
        },

        module: {
            rules: [
                {
                    test: /\.vue$/,
                    include: options.includeDirs,
                    loader: 'vue-loader',
                },
                {
                    test: /\.(tsx?|jsx?)$/,
                    include: options.includeDirs,
                    use: [
                        {
                            loader: 'cache-loader',
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                babelrc: false,
                                ...babelConfig(),
                            },
                        },
                    ],
                },
                {
                    test: /\.html$/,
                    include: options.includeDirs,
                    use: 'raw-loader',
                },
                {
                    test: /\.(sc|c)ss$/,
                    include: options.includeDirs,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: env === 'development',
                            },
                        },
                        { loader: 'css-loader' },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    autoprefixer(),
                                ],
                            },
                        },
                        { loader: 'resolve-url-loader' },
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    importer: globImporter(),
                                    // includePaths: [
                                    //     path.resolve(APP_DIR, 'node_modules'),
                                    // ],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/,
                    include: options.includeDirs,
                    loader: 'svg-inline-loader',
                },
                {
                    test: /\.(woff2?|ttf|otf|eot|svg|png)$/,
                    include: options.includeDirs,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
            ],
        },

        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    parallel: true,
                    uglifyOptions: {
                        warnings: false,
                        parse: {},
                        compress: {
                            keep_fnames: true,
                            toplevel: false,
                            keep_classnames: false,
                        },
                        mangle: false,
                        output: null,
                        toplevel: false,
                        nameCache: null,
                        ie8: false,
                        keep_fnames: true,
                        keep_classnames: false,
                        safari10: true,
                    },
                }),
            ],
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: path.join(SRC_DIR, 'html.html'),
                excludeAssets: [
                    // /.*.css/,
                ],
                chunks: [
                    'javascript',
                ],
                baseTag: './',
            }),
            new HtmlWebpackPlugin({
                template: path.join(SRC_DIR, 'ejs.ejs'),
                excludeAssets: [
                    // /.*.css/,
                ],
                chunks: [
                    'typescript',
                ],
                baseTag: './',
            }),
            new WebpackAssetsManifest({
                writeToDisk: true,
            }),
            new DuplicatesPlugin({
                // Emit compilation warning or error? (Default: `false`)
                emitErrors: false,
                // Display full duplicates information? (Default: `false`)
                verbose: true,
            }),
            new MiniCssExtractPlugin({ // define where to save the file
                filename: '[name].bundle.[contenthash].css',
            }),
            new CopyWebpackPlugin(options.staticFiles),
            new VueLoaderPlugin(),
        ],
    }

    return config
}
