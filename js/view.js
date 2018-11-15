import {
    $,
    pull,
    get,
    make,
    append,
    score,
    hash,
    inject_svg,
    stamp_to_date,
    parse_date,
    get_param,
    gen_item,
    gen_list,
    gen_data,
    load_item
} from "./core.js";
const dim_catalog = [416, 234];
const themes = [
    "imperial",
    "charcoal",
    "cherry"
];
const defs = {mode: 1, theme: 1};
const stamp = get_param();

const skeleton = (recap, games, stamps) => {
    // header contains title, scoring, and fields
    // media/text are used as is with catalog view, enclosed in multiple pair divs with list view
    let content = $(".content");
    for (const title in recap) {
        let g = games[title];
        let item = gen_item(g.alias.pop() || title, `games?${hash(title)}`);
        let scoring = score(g, stamps);
        item.id = `g${content.children.length}`;
        item.dataset.title = title;
        append(get(item, "title"), make("p", `${scoring.val}, ${scoring.activity}`));
        append(get(item, "header"), gen_data(g));
        append(content, item);
    }
}

const catalog = (recap, games) => {
    let content = $(".content");
    content.classList.remove("content--v");
    for (const item of content.children) {
        let r = recap[item.dataset.title];
        let pairs = Object.keys(r);
        let link = get(get(item, "stamp"), "a");
        // recycle first media/text pair generated from list view
        // pair divs exist -> from list
        if (get(item, "pair")) {
            let pairs = item.getElementsByClassName("pair");
            let first = pairs[0];
            while (pairs[0]) {
                item.removeChild(pairs[0]);
            }
            append(item, [get(first, "media"), get(first, "text")]);
        }
        item.className = "ic";
        link.dataset.index = 0;
        if (pairs.length > 1) {
            link.addEventListener("mousedown", (e) => e.detail > 1 && e.preventDefault());
            link.onclick = function(e) {
                let parsed = parseInt(this.dataset.index);
                let k = pairs[parsed];
                let i = ++parsed == pairs.length ? 0 : parsed;
                this.dataset.index = i;
                get(get(item, "stamp"), "p").innerHTML = `${parsed}/${pairs.length}`;
                load_item(item, dim_catalog, stamp, k, r[k]);
            }
            link.onclick();
        } else {
            let k = pairs[0];
            delete link.dataset.index;
            load_item(item, dim_catalog, stamp, k, r[k]);
        }
    }
}

const list = (recap, games) => {
    let content = $(".content");
    content.classList.add("content--v");
    for (const item of content.children) {
        gen_list(item, stamp, recap[item.dataset.title]);
    }
}

const register = (id, field, call) => {
    let as = $(`#${id}`).getElementsByTagName("a");
    if (!localStorage.getItem(field)) {
        localStorage.setItem(field, defs[field]);
    }
    for (let i = 0; i < as.length; i++) {
        let a = as[i];
        if (!get(a.parentNode, "menu")) {
            a.onclick = function() {
                let active = $(`#${id} a[data-active]`);
                if (this != active) {
                    let parsed = parseInt(this.dataset.id);
                    localStorage.setItem(field, parsed);
                    delete active.dataset.active;
                    this.dataset.active = "";
                    return call && call(parsed);
                }
            }
        }
    }
    // mark the initially active item based on value in localStorage
    let stored = localStorage.getItem(field);
    $(`#${id} a[data-id='${stored}'`).dataset.active = "";
    call(stored);
}

let modes = [list, catalog];
let s2 = $("#s2");
let date = parse_date(stamp);
document.title = `Recap: ${stamp}`;
append(s2, inject_svg("agdg"));
append(s2, make("a", stamp_to_date(stamp)));

// initialize theme menu options
// require scss files so webpack will find them
for (let i = 0; i < themes.length; i++) {
    let a = make("a", themes[i]);
    let li = make("li");
    a.dataset.id = i;
    append($(".menu"), append(li, a));
    require(`../scss/theme/${themes[i]}.scss`);
}

pull([`res/${stamp}/data.json`, "res/games.json", "res/stamps.json"], (loaded) => {
    // generate item divs with common elements to both modes
    skeleton(...loaded);
    register("s1", "mode", (parsed) => modes[parsed](...loaded));
});
register("s3", "theme", (parsed) => $("link").href = `res/${themes[parsed]}.css`);