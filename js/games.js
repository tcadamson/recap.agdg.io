import {
    $,
    pull,
    get,
    make,
    append,
    hash,
    parse_scoring,
    stamp_to_date,
    load_file,
    get_param,
    gen_item,
    gen_list,
    gen_data
} from "./core.js";
const dim_game = [640, 175];
const map = {
    1: "Total recaps",
    2: "Longest streak",
    3: "Average amount of progress"
};
let games;
let stamps;

const shuffle = (games) => {
    let titles = Object.keys(games);
    let out = {};
    // Fisher-Yates-Durstenfeld shuffle
    for (let i = 0; i < titles.length - 1; i++) {
        let j = i + ~~(Math.random() * (titles.length - i));
        let temp = titles[j];
        titles[j] = titles[i];
        titles[i] = temp;
    }
    return titles;
}

const load = (stamp, title) => {
    let place = make("div");
    place.id = `i${stamp}`;
    append($(".content"), place);
    pull(`res/${stamp}/data.json`, (data) => {
        if (data != 404) {
            let item = gen_item(stamp_to_date(stamp), `view?${stamp}`);
            $(".content").replaceChild(item, $(`#i${stamp}`));
            gen_list(item, stamp, data[title]);
        }
    });
}

const random_choice = (arg, shift = 0) => {
    if (!Array.isArray(arg)) {
        return ~~(Math.random() * arg);
    }
    return arg[shift + ~~(Math.random() * arg.length)];
}

const random_media = (item, title) => {
    // select random block in scores array (stamp:streak:count)
    // use streak count to select random stamp from that block, then pull random file from that recap
    let g = games[title];
    let scoring = parse_scoring(random_choice(g.score));
    let stamp = stamps[stamps.indexOf(scoring.stamp) + random_choice(scoring.streak)];
    pull(`res/${stamp}/data.json`, (data) => {
        let pairs = Object.keys(data[title]);
        // if it is possible, avoid selecting the default recap image
        pairs = pairs.filter(p => !p.includes("default"));
        let pair = pairs.length > 0 ? random_choice(pairs) : "default";
        append(get(item, "media"), load_file(stamp, pair, dim_game));
    });
}

const gen_ranks = (stats) => {
    let ranks = {};
    for (const id in map) {
        let temp = [];
        for (const title in games) {
            let stat = stats[title][id];
            ranks[title] = ranks[title] || {};
            stat = typeof stat == "string" ? parseInt(/\d*/.exec(stat)) : stat;
            temp.push({title: title, [id]: stat});
        }
        // descending ranks for each stat, grouping any ties
        // if at some point spread exists such that lowest rank enters triple digits, tweak table width
        temp.sort((a, b) => b[id] - a[id]);
        let rank = 1;
        ranks[temp[0].title][id] = rank;
        for (let i = 1; i < temp.length; i++) {
            let data = temp[i];
            ranks[data.title][id] = data[id] == temp[i - 1][id] ? rank : ++rank;
        }
    }
    return ranks;
}

const focus = (title) => {
    let g = games[title];
    let alias = g.alias.pop() || title;
    let content = $(".content");
    document.title = `Games: ${alias}`;
    append(content, [make("h2", alias), make("h2", "stats")]);
    append(content, append(make("div").class("box"), make("table").class("game")));
    for (const s of g.score.reverse()) {
        let scoring = parse_scoring(s);
        let stamp = scoring.stamp;
        let c = scoring.streak;
        let i = stamps.indexOf(stamp);
        load(stamps[i + c - 1], title);
        while (--c > 0) {
            load(stamps[i + c - 1], title);
        }
    }
    pull("res/stats.json", (stats) => {
        let table = $(".game");
        let ranks = gen_ranks(stats);
        for (const id in map) {
            let f = make("td", map[id]).class("field");
            let v1 = make("td", stats[title][id]);
            let v2 = make("td", `#${ranks[title][id]}`);
            append(table, append(make("tr"), [
                f,
                v1,
                v2
            ]));
        }
    });
}

pull(["res/games.json", "res/stamps.json"], (loaded) => {
    games = loaded.shift();
    stamps = loaded.shift().all;
    let content = $(".content");
    let titles = Object.keys(games);
    let hashed = get_param();
    let title;
    while (!title && titles.length > 0) {
        let k = titles.pop();
        let h = hash(k);
        title = (h == hashed) && k;
    }
    if (title) {
        focus(title);
    } else {
        for (const title of shuffle(games)) {
            // gen_list unsuitable; custom constructor
            let g = games[title];
            let item = gen_item(g.alias.pop() || title, `games?${hash(title)}`);
            let pair = make("div").class("pair", "pair--g");
            let text = make("div").class("text");
            item.removeChild(get(item, "text"));
            item.className = "il";
            append(pair, [item.removeChild(get(item, "media")), append(text, gen_data(g))]);
            append(item, pair);
            random_media(item, title);
            append(content, item);
        }
    }
});