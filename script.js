let images = [];

async function loadData() {
    const res = await fetch("data.json");
    images = await res.json();
    render(images);
}

// convert file → base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// IMPORTANT: create GitHub issue (no auth needed)
async function uploadImage() {
    const file = document.getElementById("fileInput").files[0];
    const caption = document.getElementById("captionInput").value;

    if (!file || !caption) {
        alert("Select file + caption");
        return;
    }

    const base64 = await toBase64(file);
    const filename = Date.now() + "-" + file.name;

    const res = await fetch("https://image-vault-api.thethoughtgenie.workers.dev", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filename,
            caption,
            image: base64
        })
    });

    if (res.ok) {
        alert("Upload successful ✅");
        loadData();
    } else {
        alert("Upload failed ❌");
    }
}

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

document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();

    const filtered = images
        .filter(img => img.caption.toLowerCase().includes(q));

    render(filtered);
});

loadData();