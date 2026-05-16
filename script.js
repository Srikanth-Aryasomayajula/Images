let images = [];

async function loadData() {
    const res = await fetch("data.json");
    images = await res.json();
    render(images);
}

// IMPORTANT: create GitHub issue (no auth needed)
async function uploadImage() {
  const file = document.getElementById("fileInput").files[0];
  const caption = document.getElementById("captionInput").value;

  if (!file || !caption) {
    alert("Select file + caption");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("caption", caption);
  formData.append("filename", Date.now() + "-" + file.name);

  const res = await fetch("https://image-vault-api.thethoughtgenie.workers.dev/upload", {
    method: "POST",
    body: formData
  });

  const text = await res.text();

  if (!res.ok) {
    alert("Upload failed: " + text);
    return;
  }

  alert("Upload successful!");

  // reload gallery immediately
  loadData();
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