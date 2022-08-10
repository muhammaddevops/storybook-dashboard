const webpack = require("webpack");
const path = require("path");
const fs = require('fs');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const HtmlWebpackPlugin = require("html-webpack-plugin");
//const CopyWebpackPlugin = require("copy-webpack-plugin");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

let DEV_SERVER_PROXY_HOST = "http://localhost:8001";
//let DEV_SERVER_PROXY_HOST = "https://uk.test.sustainabilitytool.com";
let DEV_SERVER_PROXY_SECURE = DEV_SERVER_PROXY_HOST.startsWith("https");
let DEV_SERVER_PROXY_CHANGEORIGIN = true;
let DEV_SERVER_PROXY_BLOCK = {
  target: DEV_SERVER_PROXY_HOST,
  secure: DEV_SERVER_PROXY_SECURE,
  changeOrigin: DEV_SERVER_PROXY_CHANGEORIGIN
};

let devLibEntries = {};
let devLibAliases = {};
if (false && process.env.NODE_ENV != "production") {
  console.log("LINKING DEVELOPMENT LIBRARIES IN ./lib");
  devLibEntries = {
    traec: "./lib/traec/index.js",
    "traec-react": "./lib/traec-react/index.js"
  };
  devLibAliases = {
    traec: path.resolve(__dirname, "lib/traec"),
    "traec-react": path.resolve(__dirname, "lib/traec-react")
  };
} else {
  console.log(`WEBPBACK CONFIG IN ${process.env.NODE_ENV} SETTING`);
}

module.exports = {
  entry: Object.assign(
    {
      app: "./src/index.js",
      //company: "./src/company/index.js",
      //project: "./src/project/index.js"
    },
    devLibEntries
  ),
  output: {
    filename: process.env.NODE_ENV == "production" ? "[name].[contenthash:8].bundle.js" : "[name].[hash].bundle.js",
    chunkFilename:
      process.env.NODE_ENV == "production" ? "chunk-[name].[contenthash:8].bundle.js" : "chunk-[name].[hash].bundle.js",
    publicPath: "/",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 10000, // Webpack default is 30kb (30000) for min bundle size
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace("@", "")}`;
          }
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(eot|otf|svg|ttf|woff|woff2|png)$/,
        use: {
          loader: "file-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: "style-loader"
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: "css-loader"
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [require("autoprefixer")];
              }
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: "sass-loader"
          }
        ]
      },
      { test: /\.(txt|md)$/, use: "raw-loader" }
    ]
  },
  plugins: [
    //new webpack.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "./index.html"
    }),
    //new CopyWebpackPlugin([{ from: "./assets", to: "assets" }])
  ],
  resolve: {
    symlinks: false,
    alias: Object.assign(
      {
        AppSrc: path.resolve(__dirname, "src/"),
        AppAssets: path.resolve(__dirname, "assets/")
      },
      devLibAliases
    )
  },
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, "../src"),
    //watchFiles: true,
    proxy: {
      "/api/*": DEV_SERVER_PROXY_BLOCK,
      "/auth-jwt/*": DEV_SERVER_PROXY_BLOCK,
      "/auth-rest/*": DEV_SERVER_PROXY_BLOCK,
      "/static/*": DEV_SERVER_PROXY_BLOCK
    },
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    static: {
      // By default WebpackDevServer serves physical files from current directory
      // in addition to all the virtual build products that it serves from memory.
      // This is confusing because those files won’t automatically be available in
      // production build folder unless we copy them. However, copying the whole
      // project directory is dangerous because we may expose sensitive files.
      // Instead, we establish a convention that only files in `public` directory
      // get served. Our build script will copy `public` into the `build` folder.
      // In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%:
      // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
      // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
      // Note that we only recommend to use `public` folder as an escape hatch
      // for files like `favicon.ico`, `manifest.json`, and libraries that are
      // for some reason broken when imported through webpack. If you just want to
      // use an image, put it in `src` and `import` it from JavaScript instead.
      directory: path.resolve(__dirname, "public"),
      publicPath: ["/"],
      // By default files from `contentBase` will not trigger a page reload.
      watch: {
        // Reportedly, this avoids CPU overload on some systems.
        // https://github.com/facebook/create-react-app/issues/293
        // src/node_modules is not ignored to support absolute imports
        // https://github.com/facebook/create-react-app/issues/1065
        ignored: ignoredFiles(resolveApp('src')),
      }
    }
  }
}
