let images = [];

async function loadData() {
    const res = await fetch("data.json");
    images = await res.json();
    render(images);
}

// IMPORTANT: create GitHub issue (no auth needed)
async function uploadImage() {
  const file = document.getElementById("fileInput").files[0];
  const caption = document.getElementById("captionInput").value.trim();
  const id = caption.toLowerCase().replace(/\s+/g, "-");

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
  formData.append("id", id);
  formData.append("filename", Date.now() + "-" + file.name);

  try {
      const res = await fetch("https://image-vault-api.thethoughtgenie.workers.dev/upload", {
        method: "POST",
        body: formData
      });
    
      const data = await res.json();
    
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }
    
      status.innerText = "✅ Upload completed. Wait for 30-45 seconds and refresh the page to see the uploaded image";
    
      setTimeout(() => {
		  location.reload();
	  }, 5000);
    
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
			<div class="card" data-id="${img.id}">
				<img 
					src="${img.file}"
					alt="${img.caption}"
					title="${img.caption}"
					onclick="openModal('${img.file}', '${img.id}')"
					loading="lazy"
				>
				<div class="caption">${img.caption}</div>
			</div>
		`;
    });
}

function openModal(src, id) {
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modalImg");
    const downloadBtn = document.getElementById("downloadBtn");

    modal.style.display = "flex";
    modalImg.src = src;
    downloadBtn.href = src;

    // 🔥 update URL without reload
    const extension = "jpg"; // or dynamic if you store it later
	history.pushState(null, "", `/ImageVault/image/${id}.${extension}`);
}

async function getAI() {
  const path = window.location.pathname.replace("/ImageVault", "");

  const res = await fetch(`https://image-vault-api.thethoughtgenie.workers.dev${path}/ai`);
  const data = await res.json();

  document.getElementById("ai-box").innerText =
    data.description || "No AI result";
}

document.getElementById("close").onclick = () => {
    document.getElementById("modal").style.display = "none";
    history.pushState(null, "", "/");
};

document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();

    const filtered = images
        .filter(img =>
			img.caption.toLowerCase().includes(q) ||
			img.id.toLowerCase().includes(q)
		);

    render(filtered);
});

loadData();

window.addEventListener("load", async () => {
    const path = window.location.pathname;

    if (path.startsWith("/image/")) {
        let id = path.split("/image/")[1];
		
		// remove extension if present
		id = id.replace(/\.(jpg|jpeg|png|webp)$/i, "");

        const res = await fetch(`https://image-vault-api.thethoughtgenie.workers.dev/image/${id}`);
        const data = await res.json();

        if (data.file) {
            openModal(data.file, data.id);
        }
    }
});