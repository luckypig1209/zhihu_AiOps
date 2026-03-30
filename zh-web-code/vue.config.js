"use strict";
const path = require("path");
const defaultSettings = require("./src/settings.js");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const CompressionPlugin = require("compression-webpack-plugin");

// 根据环境变量或默认值选择语言
const language = process.env.VUE_APP_DEFAULT_LOCALE || 'en';
const name =  language === 'en' ? 'SmartGuard' : '智护'; // 网页标题

const port = process.env.port || process.env.npm_config_port || 80; // 端口
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

// vue.config.js 配置说明
//官方vue.config.js 参考文档 https://cli.vuejs.org/zh/config/#css-loaderoptions
// 这里只列一部分，具体配置参考文档
module.exports = {
  filenameHashing: true,
  // 部署生产环境和开发环境下的URL。
  // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
  // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
  publicPath: process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : "/",
  // 在npm run build 或 yarn build 时 ，生成文件的目录名称（要和baseUrl的生产环境路径一致）（默认dist）
  outputDir: "dist",
  // 用于放置生成的静态资源 (js、css、img、fonts) 的；（项目打包之后，静态资源会放在这个文件夹下）
  assetsDir: "static",
  // 是否开启eslint保存检测，有效值：ture | false | 'error'
  lintOnSave: process.env.NODE_ENV === "development",
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  // webpack-dev-server 相关配置
  devServer: {
    host: "0.0.0.0",
    port: port,
    open: false,
    proxy: {
      "/infra": {
        // target: `http://121.229.159.13:48080`,
        // target: `http:/172.2.0.197:48080`,
        //  target: `http://121.229.159.15:48080`, //
        // target: `http://121.229.159.13:58080`, //公共
        target: `http://117.89.88.210:58080`,
        // target: `http://117.89.88.220:58080`,
        //  target:'http://121.229.159.15:58080/',//测试
        // target: `http://132.254.89.158:28090`,
        changeOrigin: true,
        logLevel: "debug",
        pathRewrite: {},
      },
      "/cqt": {
        // target: `http://27.27.1.49:28090`,
        // target: `http://172.2.0.197:48080`,
        // target: `http:/172.2.0.197:48080`,
        //  target: `http://121.229.159.15:48080`, //开发
        //  target: `http://121.229.159.13:58080`, //公共
        target: `http://117.89.88.210:58080`,
        // target: `http://117.89.88.220:58080`,
        //  target:'http://121.229.159.15:58080/',//测试
        // target: `http://132.254.89.158:28090`,
        changeOrigin: true,
        logLevel: "debug",
        pathRewrite: {},
      },
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      "/admin-api": {
        // target: `http://27.27.1.49:28090`,
        //  target: `http:/172.2.0.197:48080`,
        // target: `http://121.229.159.15:48080`,//开发
        //  target: `http://121.229.159.13:58080`, //公共
        target: `http://117.89.88.210:58080`,
        // target: `http://117.89.88.220:58080`,
        // target:'http://121.229.159.15:58080/',//测试

        // target: `http://132.254.89.158:28090`,
        changeOrigin: true,
        logLevel: "debug",
        pathRewrite: {
          // ['^' + process.env.VUE_APP_BASE_API]: ''
        },
      },
      "/acc": {
        target: `http://132.254.87.62:38081`,
        changeOrigin: true,
        logLevel: "debug",
        pathRewrite: {},
      },
      "/vm-api": {
        target: `http://117.89.88.210:29090`,
        changeOrigin: true,
        logLevel: "debug",
        pathRewrite: { "^/vm-api": "" },
      },
      "/zabbix-api": {
        target: `http://117.89.88.210:28080`,
        changeOrigin: true,
        logLevel: "debug",
        pathRewrite: { "^/zabbix-api": "" },
      },
    },
    disableHostCheck: true,
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: { outputStyle: "expanded" },
      },
    },
  },
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
    output: {
      filename: '[name].[hash:8].js',
      chunkFilename: '[name].[hash:8].js',
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        maxSize: 244 * 1024, // 拆分大文件
        cacheGroups: {
          // echarts: {
          //   test: /[\\/]node_modules[\\/]echarts[\\/]/,
          //   name: 'echarts',
          //   priority: 20
          // },
          elementUI: {
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            name: "elementUI",
            priority: 20,
          },
        },
      },
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: true, // 移除console
              drop_debugger: true, // 移除debugger
            },
          },
        }),
      ],
    },
    plugins: [
      // http://doc.ruoyi.vip/ruoyi-vue/other/faq.html#使用gzip解压缩静态文件
      new CompressionPlugin({
        cache: false, // 不启用文件缓存
        test: /\.(js|css|html)?$/i, // 压缩文件格式
        filename: "[path].gz[query]", // 压缩后的文件名
        algorithm: "gzip", // 使用gzip压缩
        minRatio: 0.8, // 压缩率小于1才会压缩
        threshold: 10240, // 大于10KB的文件进行压缩
      }),
      // new CompressionPlugin({
      //   filename: '[path][base].br',
      //   algorithm: 'brotliCompress',
      //   test: /\.(js|css|html|svg)$/,
      //   compressionOptions: { level: 11 },
      //   threshold: 10240,
      // }),
      // new BundleAnalyzerPlugin()
    ],
  },
  chainWebpack(config) {
    config.plugins.delete("preload"); // TODO: need test
    config.plugins.delete("prefetch"); // TODO: need test
    config.devtool(false);

    // set svg-sprite-loader
    config.module.rule("svg").exclude.add(resolve("src/assets/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/assets/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();

    config.when(process.env.NODE_ENV !== "development", (config) => {
      config
        .plugin("ScriptExtHtmlWebpackPlugin")
        .after("html")
        .use("script-ext-html-webpack-plugin", [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/,
          },
        ])
        .end();
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: "initial", // only package third parties that are initially dependent
          },
          elementUI: {
            name: "chunk-elementUI", // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order to adapt to cnpm
          },
          commons: {
            name: "chunk-commons",
            test: resolve("src/components"), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      });
      config.optimization.runtimeChunk("single"),
        {
          from: path.resolve(__dirname, "./public/robots.txt"), //防爬虫文件
          to: "./", //到根目录下
        };
    });
  },
};
