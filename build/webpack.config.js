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
    {title: "Home", template: true},
    {title: "Info", template: true},
    {title: "Archive", template: true},
    {title: "Scores"},
    {title: "Games"},
    {title: "View", template: true},
    new exclude()
];

module.exports = {
    entry: {
        core: "../js/core.js",
        index: "../js/index.js",
        archive: "../js/archive.js",
        scores: "../js/scores.js",
        games: "../js/games.js",
        view: "../js/view.js"
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
};

for (let i = 0; i < plugins.length; i++) {
    let build = plugins[i];
    if (build.title) {
        let resolved = build.title.toLowerCase().replace("home", "index");
        let chunks = ["core"];
        if (module.exports.entry[resolved]) {
            chunks.push(resolved);
        }
        build = new html({
            title: build.title,
            filename: `${resolved}.html`,
            template: `../${build.template ? resolved : "archive"}.html`,
            excludeAssets: resolved == "view" ? [/res\/.*\.css/] : null,
            chunks: chunks
        });
    }
    plugins[i] = build;
}

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

module.exports.module = {rules: rules};
module.exports.plugins = plugins;