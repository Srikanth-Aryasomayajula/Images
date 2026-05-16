const OWNER = "srikanth-aryasomayajula";
const REPO = "Images";
const TOKEN = "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";

let images = [];

// Load data.json
async function loadData() {
    const res = await fetch("data.json");
    images = await res.json();
    render(images);
}

// Convert file to base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Trigger GitHub Action (backend)
async function uploadImage() {
    const file = document.getElementById("fileInput").files[0];
    const caption = document.getElementById("captionInput").value;

    if (!file || !caption) {
        alert("Select file + caption");
        return;
    }

    const base64 = await toBase64(file);
    const filename = Date.now() + "-" + file.name;

	await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
		method: "POST",
		headers: {
			"Accept": "application/vnd.github+json",
			"Authorization": `Bearer ${TOKEN}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			event_type: "upload-image",
			client_payload: {
				filename: filename,
				caption: caption,
				image: base64
			}
		})
	});

    alert("Upload sent! Refresh in a few seconds.");
}

// AI-like search
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