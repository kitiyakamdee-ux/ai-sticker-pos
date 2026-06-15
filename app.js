// ======================
// AI Sticker POS FIXED
// ======================

let products = JSON.parse(localStorage.getItem("products")) || [];
let cameraStream = null;

// ======================
// INIT (กันปุ่มกดไม่ได้)
// ======================

document.addEventListener("DOMContentLoaded", () => {

    renderProducts();
    updateStats();

    document.getElementById("addProductBtn").addEventListener("click", addProduct);
    document.getElementById("resetBtn").addEventListener("click", resetAll);
    document.getElementById("backupBtn").addEventListener("click", backupData);
    document.getElementById("restoreBtn").addEventListener("click", () => {
        document.getElementById("restoreFile").click();
    });

    document.getElementById("restoreFile").addEventListener("change", restoreData);

    document.getElementById("cameraBtn").addEventListener("click", startCamera);
    document.getElementById("captureBtn").addEventListener("click", captureBasket);

    document.getElementById("searchInput").addEventListener("input", searchProduct);
});

// ======================
// ADD PRODUCT
// ======================

function addProduct(){

    const name = prompt("ชื่อสินค้า");
    if(!name) return;

    const price = Number(prompt("ราคา"));
    const stock = Number(prompt("จำนวนสต๊อก"));

    const imagePicker = document.getElementById("imagePicker");
    imagePicker.value = "";

    imagePicker.onchange = function(){

        const file = imagePicker.files[0];
        if(!file) return;

        const reader = new FileReader();

        reader.onload = function(e){

            products.push({
                id: Date.now(),
                name,
                price,
                stock,
                image: e.target.result
            });

            saveProducts();
            renderProducts();
            updateStats();
        };

        reader.readAsDataURL(file);
    };

    imagePicker.click();
}

// ======================
// SAVE / LOAD
// ======================

function saveProducts(){
    localStorage.setItem("products", JSON.stringify(products));
}

// ======================
// STATS
// ======================

function updateStats(){
    document.getElementById("totalProducts").textContent = products.length;
}

// ======================
// RENDER
// ======================

function renderProducts(){

    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    products.forEach(p => {

        grid.innerHTML += `
        <div class="product-card">

            <img src="${p.image}">

            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-price">฿${p.price}</div>
                <div class="product-stock">คงเหลือ ${p.stock}</div>

                <button class="edit-btn" onclick="editProduct(${p.id})">✏️ แก้</button>
                <button class="delete-btn" onclick="deleteProduct(${p.id})">🗑️ ลบ</button>
            </div>

        </div>
        `;
    });
}

// ======================
// DELETE / EDIT
// ======================

function deleteProduct(id){

    if(!confirm("ลบสินค้า?")) return;

    products = products.filter(p => p.id !== id);
    saveProducts();
    renderProducts();
    updateStats();
}

function editProduct(id){

    const p = products.find(x => x.id === id);
    if(!p) return;

    p.name = prompt("ชื่อ", p.name) || p.name;
    p.price = Number(prompt("ราคา", p.price)) || p.price;
    p.stock = Number(prompt("สต๊อก", p.stock)) || p.stock;

    saveProducts();
    renderProducts();
}

// ======================
// SEARCH
// ======================

function searchProduct(e){

    const keyword = e.target.value.toLowerCase();

    document.querySelectorAll(".product-card").forEach(card => {

        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(keyword) ? "" : "none";
    });
}

// ======================
// RESET
// ======================

function resetAll(){

    if(!confirm("ลบทั้งหมด?")) return;

    products = [];
    saveProducts();
    renderProducts();
    updateStats();
}

// ======================
// BACKUP
// ======================

function backupData(){

    const blob = new Blob(
        [JSON.stringify({products}, null, 2)],
        {type:"application/json"}
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
}

// ======================
// RESTORE
// ======================

function restoreData(e){

    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(ev){

        try{
            const data = JSON.parse(ev.target.result);
            products = data.products || [];

            saveProducts();
            renderProducts();
            updateStats();

            alert("โหลดสำเร็จ");
        }catch{
            alert("ไฟล์เสีย");
        }
    };

    reader.readAsText(file);
}

// ======================
// CAMERA
// ======================

async function startCamera(){

    const video = document.getElementById("camera");

    try{

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video:{facingMode:"environment"}
        });

        video.srcObject = cameraStream;
        video.style.display = "block";

    }catch(err){
        alert("เปิดกล้องไม่ได้");
        console.error(err);
    }
}

// ======================
// AI MATCH (สำคัญ)
// ======================

function captureBasket(){

    const video = document.getElementById("camera");

    if(!video.srcObject){
        alert("เปิดกล้องก่อน");
        return;
    }

    if(products.length === 0){
        alert("ไม่มีสินค้า");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const basketImage = canvas.toDataURL("image/jpeg");

    findBestMatch(basketImage, (product) => {

        if(!product){
            alert("ไม่พบสินค้า");
            return;
        }

        alert("AI พบ: " + product.name);
    });
}

// ======================
// SIMPLE IMAGE MATCH
// ======================

function findBestMatch(imageSrc, callback){

    let best = null;
    let bestScore = Infinity;
    let checked = 0;

    products.forEach(p => {

        const img1 = new Image();
        const img2 = new Image();

        img1.src = imageSrc;
        img2.src = p.image;

        img1.onload = img2.onload = () => {

            const c1 = document.createElement("canvas");
            const c2 = document.createElement("canvas");

            c1.width = c2.width = 50;
            c1.height = c2.height = 50;

            const ctx1 = c1.getContext("2d");
            const ctx2 = c2.getContext("2d");

            ctx1.drawImage(img1, 0, 0, 50, 50);
            ctx2.drawImage(img2, 0, 0, 50, 50);

            const d1 = ctx1.getImageData(0,0,50,50).data;
            const d2 = ctx2.getImageData(0,0,50,50).data;

            let diff = 0;

            for(let i=0;i<d1.length;i+=4){
                diff += Math.abs(d1[i]-d2[i]);
            }

            if(diff < bestScore){
                bestScore = diff;
                best = p;
            }

            checked++;

            if(checked === products.length){
                callback(best);
            }
        };
    });
}
