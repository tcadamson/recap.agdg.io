const path = require("path");
const env = require("babel-preset-env");
const html = require("html-webpack-plugin");
const exclude = require("html-webpack-exclude-assets-plugin");
const extract = require("extract-text-webpack-plugin");
const min = {
    js: require("uglifyjs-webpack-plugin"),
    css: require("optimize-css-assets-webpack-plugin")
}
const themes = [
    "imperial",
    "charcoal",
    "cherry"
];
let rules = [
   {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader",
            options: {
                presets: [env]
            }
        }
    },
    {
        test: /\.svg$/,
        use: "svg-inline-loader",
    }
];
let plugins = [
    new html({
        title: "Home",
        template: "../index.html",
        chunks: ["core", "index"]
    }),
    new html({
        title: "Info",
        filename: "info.html",
        template: "../info.html",
        chunks: ["core"]
    }),
    new html({
        title: "Archive",
        filename: "archive.html",
        template: "../archive.html",
        chunks: ["core", "archive"]
    }),
    new html({
        title: "Scores",
        filename: "scores.html",
        template: "../archive.html",
        chunks: ["core", "scores"]
    }),
    new html({
        title: "Games",
        filename: "games.html",
        template: "../archive.html",
        chunks: ["core", "games"]
    }),
    new html({
        filename: "view.html",
        template: "../view.html",
        chunks: ["core", "view"],
        excludeAssets: [/res\/.*\.css/]
    }),
    new exclude()
];

for (const theme of themes) {
    let t = new extract(`res/${theme}.css`);
    rules.push({
        test: new RegExp(`${theme}\.scss$`),
        use: t.extract([
            "css-loader",
            "sass-loader"
        ])
    });
    plugins.unshift(t);
}

module.exports = {
    entry: {
        core: "../js/core.js",
        index: "../js/index.js",
        archive: "../js/archive.js",
        scores: "../js/scores.js",
        games: "../js/games.js",
        view: "../js/view.js"
    },
    module: {
        rules: rules
    },
    output: {
        path: path.resolve(__dirname, "output"),
        filename: "[name].[chunkhash].js",
    },
    optimization: {
        minimizer: [
            new min.js(),
            new min.css()
        ]
    },
    plugins: plugins
};