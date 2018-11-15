import {
    $,
    pull,
    get,
    make,
    append,
    linkify,
    months,
    parse_date
} from "./core.js";

const group_cat = (array, cat) => {
    // group stamps by category
    // category can be any field returned by parse_date dict (y, m, w)
    let groups = {};
    while (array.length) {
        let s = array.shift();
        let c = parse_date(s)[cat];
        if (!(c in groups)) {
            groups[c] = [];
        }
        groups[c].push(s);
    }
    return groups;
}

pull("res/stamps.json", (stamps) => {
    let content = $(".content");
    let ys = group_cat(stamps.live, "y");
    for (const y in ys) {
        let table = make("table").class("months");
        let ms = group_cat(ys[y], "m");
        for (const m in ms) {
            let f = make("td", months[m]).class("field");
            let v = make("td");
            let links = make("div").class("links");
            for (const s of ms[m]) {
                let w = parse_date(s).w;
                append(links, linkify(w, `view?${s}`));
            }
            append(table, append(make("tr"), [f, append(v, links)]));
        }
        append(content, make("h2", `20${y}`));
        append(content, table);
    }
});