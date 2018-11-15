import "../scss/theme/charcoal.scss";
export const months = [
    "january",
    "febuary",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
];
const fields = [
    "dev",
    "tools",
    "web"
];
const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
];
const dim_list = [640, 360];
const json_cache = {};

const fit = (node, dim, prefix) => {
    let key = "width";
    let cut = "top";
    let ops = ["shift", "pop"];
    let dim1 = dim.slice();
    let dim2 = [node[`${prefix}Width`], node[`${prefix}Height`]];
    let ratio = dim2[0] / dim2[1];
    let target = dim[0] / dim[1];
    // ratio < 16:9 -> fit width then center vertically
    // ratio >= 16:9 -> fit height then center horizontally
    if (ratio >= target) {
        key = "height";
        cut = "left";
        ops.reverse();
    }
    node[key] = dim1[ops[0]]();
    let transform = dim2[ops[1]]();
    let excess = ((node[key] / dim2[0]) * transform) - dim1[0];
    if (Math.abs(excess) > 0) {
        node.style = `margin-${cut}: ${-excess / 2}px`;
    }
}

const unix_to_local = (unix) => {
    let noon = 12;
    let date = new Date(parseInt(unix) * 1000);
    let day = days[date.getDay()];
    let hs = date.getHours();
    let ms = date.getMinutes();
    let nhs = hs % noon;
    return `${day} ${nhs == 0 ? noon : nhs}:${fill(ms)} ${hs < noon ? "am" : "pm"}`;
}

const algo = (s, n) => {
    let scale = 3;
    return s * (s + scale) + scale * ((n - s + 1) * Math.log(n - s + 1) - n);
}

const load_img = (path, dim) => {
    let img = document.createElement("img");
    img.src = path;
    img.addEventListener("load", () => fit(img, dim, "natural"));
    return img;
}

const load_webm = (path, dim) => {
    let vid = document.createElement("video");
    let src = make("source");
    vid.autoplay = true;
    vid.muted = true;
    vid.loop = true;
    src.src = path;
    append(vid, src);
    vid.addEventListener("loadedmetadata", () => fit(vid, dim, "video"));
    return vid;
}

export const load_file = (stamp, pair, dim) => {
    let file = pair.replace(":", "");
    let path = file.includes("default") ? `res/default.png` : `res/${stamp}/${file}`;
    let loader = file.split(".")[1] == "webm" ? load_webm : load_img;
    return append(linkify("", path), loader(path, dim));
}

export const $ = (str) => document.querySelector(str);

export const fill = (str, places = 2) => {
    let out = "";
    for (let i = 0; i < places; i++) {
        out += "0";
    }
    return (out + str).slice(-places);
}

export const parse_scoring = (score) => {
    let split = score.split(":");
    let keys = [
        "stamp",
        "streak",
        "count"
    ];
    let out = {};
    for (let i = 0; i < split.length; i++) {
        let k = keys[i];
        out[k] = parseInt(split[i]);
    }
    return out;
}

export const parse_date = (stamp) => {
    let y = ~~(stamp / 1000);
    let m = ~~((stamp - y * 1000) / 10);
    return {
        y: y,
        m: --m,
        w: stamp % 10
    }
}

export const score = (g, stamps, counts) => {
    let score = 0;
    let last;
    for (const s of g.score) {
        last = parse_scoring(s);
        score += algo(last.streak, last.count);
    }
    let newcomer = last.streak == 1 && g.score.length == 1;
    let dead = stamps.all[stamps.all.indexOf(last.stamp) + (last.streak - 1)] < stamps.now;
    let basic = last.streak > 1 ? `${last.streak} streak` : "returning";
    // count refers to number of entries in a certain recap
    // when provided, delta calculates the points gained for participation in that recap
    let s_shift = counts.now ? 1 : 0;
    let c_shift = last.count - counts.now;
    let delta = counts ? algo(last.streak - s_shift, c_shift) - algo(last.streak - s_shift - 1, c_shift - counts.prev) : 0;
    return {
        val: ~~score,
        delta: ~~delta,
        last: last,
        activity: dead ? "dead" : newcomer ? "newcomer" : basic
    }
}

export const stamp_to_date = (stamp) => {
    let date = parse_date(stamp);
    return `${months[date.m]} 20${date.y}, week ${date.w}`;
}

export const inject_svg = (icon) => {
    let span = document.createElement("span");
    span.classList.add("icon", `icon--${icon}`);
    span.innerHTML = require(`../res/${icon}.svg`);
    return span;
}

export const get_param = () => {
    let param = /\?(.*)$/.exec(window.location.href);
    return parseInt(param && param[1]);
}

export const pull = (file, call) => {
    let files = Array.isArray(file) && file;
    if (files) {
        let calls = files.length;
        let out = [];
        for (const f of files) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", `${f}?${(new Date()).getTime()}`);
            xhr.send();
            xhr.onload = function() {
                out[files.indexOf(f)] = this.status != 404 ? JSON.parse(this.response) : this.status;
                return --calls <= 0 && call(out, this.status);
            }
        }
    } else {
        if (json_cache[file]) {
            return json_cache[file].push(call);
        }
        let xhr = new XMLHttpRequest();
        // pull request appends useless param to bust cache
        xhr.open("GET", `${file}?${(new Date()).getTime()}`);
        xhr.send();
        json_cache[file] = [call];
        xhr.onload = function() {
            for (const call of json_cache[file]) {
                call(this.status != 404 ? JSON.parse(this.response) : this.status);
            }
        }
    }
}

export const get = (node, tag) => {
    let classes = node.getElementsByClassName(tag);
    let tags = Array.from(node.getElementsByTagName(tag));
    let n = classes[0];
    while (!n && tags.length > 0) {
        let t = tags.shift();
        for (const c of node.children) {
            n = n || (c == t && c);
        }
    }
    return n;
}

export const make = (tag, html = "") => {
    let n = document.createElement(tag);
    n.innerHTML = html;
    // helper function to add classes to created node
    n.class = (...args) => {
        for (const a of args) {
            n.classList.add(a);
        }
        return n;
    }
    return n;
}

export const append = (node, children) => {
    children = Array.isArray(children) ? children : [children];
    for (const c of children) {
        node.appendChild(c);
    }
    return node;
}

export const hash = (str) => {
    let hash = 0;
    let chars = 10;
    if (str.length == 0) return hash;
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash = hash & hash;
    }
    return fill(Math.abs(hash), chars);
}

export const linkify = (text, location = `games?${hash(text)}`) => {
    let a = make("a", text);
    let host = "http://recap.agdg.io";
    a.href = `${host}/${location}`;
    a.target = "_blank";
    return a;
}

export const gen_data = (g) => {
    let data = make("table").class("data");
    let body = make("tbody");
    for (const field of fields) {
        let f = make("td", field).class("field");
        let v = g[field];
        if (field == "web") {
            let links = g[field].split("<br>");
            let out = [];
            for (const a of links) {
                out.push(`<a href="http://${a}" target="_blank">${a}</a>`);
            }
            v = out.join("<br>");
        }
        append(body, append(make("tr"), [f, make("td", v)]));
    }
    return append(data, body);
}

export const gen_item = (text, location) => {
    let item = make("div");
    let header = make("div").class("header");
    let title = make("div").class("title");
    append(title, linkify(text, location));
    append(item, append(header, title));
    append(item, gen_pair());
    return item;
}

export const gen_list = (item, stamp, recap) => {
    let keys = Object.keys(recap);
    item.className = "il";
    for (const k of keys) {
        let pair = make("div").class("pair");
        // prune lone media/text generated from catalog view
        // media/text not in pair div -> from catalog
        // could recycle, but then the stamp link and counter would have to be manually reverted
        let media = get(item, "media");
        if (media.parentNode == item) {
            let text = get(item, "text");
            item.removeChild(media);
            item.removeChild(text);
        }
        append(pair, gen_pair());
        append(item, pair);
        load_item(pair, dim_list, stamp, k, recap[k]);
    }
}

export const gen_pair = () => {
    let media = make("div").class("media");
    let text = make("div").class("text");
    let stamp = make("div").class("stamp");
    append(stamp, [make("a"), make("p")]);
    return [media, append(text, [stamp, make("p")])];
}

export const load_item = (item, dim, stamp, pair, progress) => {
    let media = get(item, "media");
    let unix = pair.split(":")[0];
    media.innerHTML = "";
    get(get(item, "text"), "p").innerHTML = progress;
    get(get(item, "stamp"), "a").innerHTML = unix_to_local(unix);
    append(media, load_file(stamp, pair, dim));
}