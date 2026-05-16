const OWNER = "srikanth-aryasomayajula";
const REPO = "Images";
const TOKEN = CONFIG.token;

let images = [];

// Load JSON
async function loadData() {
    const res = await fetch("data.json");
    images = await res.json();
    render(images);
}

// Convert file → base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Upload image to GitHub
async function uploadToGitHub(file, filename, base64) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${filename}`;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "upload image",
            content: base64
        })
    });

    return res.json();
}

// Update data.json
async function updateJSON(newEntry) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data.json`;

    // get current file
    const getRes = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        }
    });

    const fileData = await getRes.json();
    const content = atob(fileData.content);
    const json = JSON.parse(content);

    json.push(newEntry);

    const updatedContent = btoa(JSON.stringify(json, null, 2));

    await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "update data.json",
            content: updatedContent,
            sha: fileData.sha
        })
    });
}

// Upload flow
async function uploadImage() {
    const file = document.getElementById("fileInput").files[0];
    const caption = document.getElementById("captionInput").value;

    if (!file || !caption) return alert("Missing file or caption");

    const base64 = await toBase64(file);
    const filename = Date.now() + "-" + file.name;

    await uploadToGitHub(file, filename, base64);

    const newEntry = {
        file: "images/" + filename,
        caption: caption.toLowerCase()
    };

    await updateJSON(newEntry);

    alert("Uploaded!");
    loadData();
}

// search AI-like scoring
function score(text, query) {
    text = text.toLowerCase();
    query = query.toLowerCase();

    let score = 0;
    const words = query.split(" ");

    for (let w of words) {
        if (text.includes(w)) score += 2;
    }

    if (text.includes(query)) score += 5;

    return score;
}

// render
function render(list) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    list.forEach(img => {
        gallery.innerHTML += `
            <div class="card">
                <img src="${img.file}">
                <div class="caption">${img.caption}</div>
            </div>
        `;
    });
}

// search
document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value;

    const sorted = [...images]
        .map(img => ({ ...img, s: score(img.caption, q) }))
        .sort((a, b) => b.s - a.s);

    render(sorted.filter(x => !q || x.s > 0));
});

loadData();