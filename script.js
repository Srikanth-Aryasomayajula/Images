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

  const status = document.createElement("div");
  status.innerText = "⏳ Uploading...";
  status.style.marginTop = "10px";
  document.querySelector(".upload-box").appendChild(status);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("caption", caption);
  formData.append("filename", Date.now() + "-" + file.name);

  try {
    const res = await fetch("https://image-vault-api.thethoughtgenie.workers.dev/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    // 🎉 SUCCESS = "green tick moment"
    status.innerText = "✅ Upload complete! Repo updated";

    setTimeout(() => status.remove(), 3000);

    loadData();

  } catch (err) {
    status.innerText = "❌ Upload failed";
    console.error(err);
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