import {
    $,
    pull,
    make,
    append,
    hash,
    score,
    linkify
} from "./core.js";
let groups = [];

const lower_bound = (i) => {
    let scale = 100;
    let coef = 0.6931472;
    let result = ~~(2 * Math.pow(Math.E, coef * i) - 2) * scale;
    return result > 0 ? result : 1;
}

const find_range_index = (score) => {
    // range index is parameter for range function
    // find the largest index that still includes given score
    let ri = 0;
    while (lower_bound(ri + 1) < score) {
        ri++;
    }
    return ri;
}

const stable_sort = (groups) => {
    groups.sort((a, b) => {
        let desc = b.scoring.val - a.scoring.val;
        return a.scoring.val == b.scoring.val ? a.pos - b.pos : desc;
    });
}

const build_tiers = (groups) => {
    let content = $(".content");
    let i = 0;
    let group = groups[i];
    let ri = find_range_index(group.scoring.val);
    // ri = 0 -> 0-199
    // ri = 1 -> 200-599
    while (ri >= 0) {
        let str = `${lower_bound(ri)}-${lower_bound(ri + 1) - 1}`;
        let box = make("div").class("box");
        let scores = make("table").class("scores");
        while (group && group.scoring.val >= lower_bound(ri)) {
            let f = make("td").class("field");
            let v1 = make("td", group.scoring.val);
            let v2 = make("td", group.scoring.activity);
            append(f, linkify(group.alias, `games?${hash(group.title)}`));
            append(scores, append(make("tr"), [
                f,
                v1,
                v2
            ]));
            group = groups[++i];
        }
        ri--;
        append(content, make("h2", str));
        append(content, append(box, scores));
    }
}

pull(["res/games.json", "res/stamps.json"], (loaded) => {
    let games = loaded.shift();
    let stamps = loaded.shift();
    // load groups with title, score, streak, pos (for sorting)
    for (const title in games) {
        groups.push({
            title: title,
            alias: games[title].alias.pop() || title,
            scoring: score(games[title], stamps),
            pos: groups.length,
        });
    }
    stable_sort(groups);
    build_tiers(groups);
});