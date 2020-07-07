const ejs = require("ejs");
const webpack = require("webpack");

const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const { VueLoaderPlugin } = require("vue-loader");
const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin");

const ExtensionReloader = require("webpack-extension-reloader");

const config = {
  mode: process.env.NODE_ENV,
  context: __dirname + "/src",

  entry: {
    "popup/index": "./popup/index.ts",
    "editor/index": "./editor/index.ts",
    "options/index": "./options/index.ts",
    "background/index": "./background/index.ts",
    "inject-css/index": "./inject-css/index.ts",
  },

  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    publicPath: "/",
  },

  resolve: {
    extensions: [".ts", ".js", ".vue", ".ttf"],
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                fiber: require("fibers"),
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      global: "window",
    }),
    // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    new MonacoEditorPlugin({
      publicPath: "/",
      languages: ["css"],
    }),
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "img",
          to: "img",
        },
        {
          from: "options/index.html",
          to: "options/index.html",
          transform: transformHtml,
        },
        {
          from: "popup/index.html",
          to: "popup/index.html",
          transform: transformHtml,
        },
        {
          from: "manifest.json",
          to: "manifest.json",
          transform: (content) => {
            const jsonContent = JSON.parse(content);

            if (config.mode === "development") {
              jsonContent["content_security_policy"] =
                "script-src 'self' 'unsafe-eval'; object-src 'self'";
            }

            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ],
    }),
  ],
};

if (config.mode === "production") {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}

if (process.env.HMR === "true") {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: __dirname + "/src/manifest.json",
    }),
  ]);
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}

module.exports = config;