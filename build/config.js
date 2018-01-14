({
    appDir: "node/working/transpiled",
    baseUrl: ".",
    dir: "output/js",
    optimizeCss: "standard",
    writeBuildTxt: false,
    paths: {
        jquery: "empty:",
        moment: "empty:"
    },
    modules: [
        {
            name: "main",
            include: [
                "jquery",
                "moment",
                "module/deferred"
            ]
        },
        // Home
        {
            name: "module/m1",
            exclude: ["main"]
        },
        // Scores
        {
            name: "module/m2",
            exclude: ["main"]
        },
        // Timeline
        {
            name: "module/m3",
            exclude: ["main"]
        },
    ]
});