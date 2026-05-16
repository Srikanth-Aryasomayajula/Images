let images = JSON.parse(localStorage.getItem("images")) || [];

function uploadImage() {
    const file = document.getElementById("imgInput").files[0];
    const caption = document.getElementById("captionInput").value;

    if (!file || !caption) {
        alert("Please select image and enter caption");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        images.push({
            id: Date.now(),
            img: e.target.result,
            caption: caption.toLowerCase()
        });

        localStorage.setItem("images", JSON.stringify(images));

        document.getElementById("imgInput").value = "";
        document.getElementById("captionInput").value = "";

        renderImages();
    };

    reader.readAsDataURL(file);
}

// simple smart scoring search
function scoreMatch(text, query) {
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

function renderImages() {
    const query = document.getElementById("searchInput").value;

    const sorted = [...images]
        .map(img => ({
            ...img,
            score: scoreMatch(img.caption, query)
        }))
        .sort((a, b) => b.score - a.score);

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    sorted.forEach(img => {
        if (query && img.score === 0) return;

        gallery.innerHTML += `
            <div class="card">
                <img src="${img.img}" />
                <div class="caption">${img.caption}</div>
            </div>
        `;
    });
}

// initial render
renderImages();