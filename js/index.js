import {
    $,
    pull,
    make,
    append,
    score,
    linkify,
    inject_svg,
    stamp_to_date,
    get_param
} from "./core.js";
const secret = 27182818;
const map = {
    1: "Total recaps",
    2: "Total games",
    3: "Average number of recap entries",
    4: "Average amount of progress",
    5: "Most used tools"
};
let cats = {
    points: [],
    newcomers: [],
    returning: []
};

const text = (str) => document.createTextNode(str);

const capitalize = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const push_cat = (g, t, scoring, counts) => {
    let s_shift = counts.now ? 1 : 0;
    let activity = scoring.last.streak - s_shift == 1 ? g.score.length == 1 ? "newcomer" : "returning" : "";
    if (activity) {
        cats[activity].push(t)
    }
}

if (get_param() == secret) {
    // prints summary of the previous week for posting in the thread
    // may eventually be deprecated in favor of dedicated stats page per recap
    let content = $(".content");
    let box = make("div").class("box");
    content.innerHTML = "";
    append(content, box);
    pull("res/stamps.json", (stamps) => {
        let stamp = stamps.all[stamps.all.indexOf(stamps.now) - 1];
        pull([`res/${stamp}/data.json`, `res/${stamps.now}/data.json`, "res/games.json"], (loaded) => {
            let prev = loaded.shift();
            let now = loaded.shift();
            let games = loaded.shift();
            for (const title in prev) {
                let g = games[title];
                let r = prev[title];
                let t = g.alias.pop() || title;
                let counts = {prev: Object.keys(r).length, now: Object.keys(now[title] || []).length}
                let scoring = score(g, stamps, counts);
                cats.points.push({
                    title: t,
                    delta: scoring.delta,
                    entries: `${counts.prev} ${counts.prev > 1 ? "entries" : "entry"}`
                });
                push_cat(g, t, scoring, counts);
            }
            cats.points.sort((a, b) => b.delta - a.delta);
            append(box, make("p", capitalize(stamp_to_date(stamp))));
            for (const cat in cats) {
                let items = make("p");
                append(items, [text(`${capitalize(cat)}:`), make("br")]);
                append(box, items);
                for (const item of cats[cat]) {
                    let str = typeof item == "object" ? `+${item.delta} :: ${item.entries} :: ${item.title}` : item;
                    append(items, [text(str), make("br")]);
                }
            }
        });
    });
} else {
    append($(".logo"), inject_svg("logo"));
    pull("res/stamps.json", (stamps) => {
        let now = stamps.now;
        pull([`res/${now}/data.json`, "res/stats.json"], (loaded) => {
            let data = loaded.shift();
            let stats = loaded.shift();
            let table = $(".home");
            for (const id in map) {
                let f = make("td", map[id]).class("field");
                let v = make("td", stats[id]);
                append(table, append(make("tr"), [f, v]));
            }
            let games = data != 404 ? Object.keys(data).length : 0;
            append($("h2"), [linkify(now, `view?${now}`), text(` (games: ${games})`)]);
        });
        append($(".content"), [
            make("h2"),
            make("h2", "stats"),
            append(make("div").class("box"), make("table").class("home"))
        ]);
    });
}