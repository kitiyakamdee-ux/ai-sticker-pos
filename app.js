let aiModel = null;

async function loadAI(){

    aiModel = await cocoSsd.load();

    console.log("AI READY");
}

loadAI();

let products = JSON.parse(localStorage.getItem("products")) || [];
let cameraStream = null;

// ======================
// SAFE INIT (กันปุ่มพัง)
// ======================

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ APP LOADED");

    const addBtn = document.getElementById("addProductBtn");
    const resetBtn = document.getElementById("resetBtn");
    const backupBtn = document.getElementById("backupBtn");
    const restoreBtn = document.getElementById("restoreBtn");
    const restoreFile = document.getElementById("restoreFile");
    const cameraBtn = document.getElementById("cameraBtn");
    const captureBtn = document.getElementById("captureBtn");
    const searchInput = document.getElementById("searchInput");

    console.log({
        addBtn, resetBtn, backupBtn,
        restoreBtn, cameraBtn, captureBtn
    });

    if(addBtn) addBtn.addEventListener("click", addProduct);
    if(resetBtn) resetBtn.addEventListener("click", resetAll);
    if(backupBtn) backupBtn.addEventListener("click", backupData);

    if(restoreBtn){
        restoreBtn.addEventListener("click", () => {
            restoreFile.click();
        });
    }

    if(restoreFile){
        restoreFile.addEventListener("change", restoreData);
    }

    if(cameraBtn) cameraBtn.addEventListener("click", startCamera);
    if(captureBtn) captureBtn.addEventListener("click", captureBasket);

    if(searchInput) searchInput.addEventListener("input", searchProduct);

    renderProducts();
    updateStats();
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
    if(!imagePicker) return;

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
    const el = document.getElementById("totalProducts");
    if(el) el.textContent = products.length;
}

// ======================
// RENDER
// ======================

function renderProducts(){

    const grid = document.getElementById("productGrid");
    if(!grid) return;

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
    if(!video) return;

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
// CAPTURE
// ======================

async function captureBasket(){

    if(!aiModel){
        alert("AI ยังโหลดไม่เสร็จ");
        return;
    }

    const video =
    document.getElementById("camera");

    if(!video.srcObject){
        alert("เปิดกล้องก่อน");
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const predictions = await aiModel.detect(video);

    console.log(predictions);
    alert(JSON.stringify(predictions));

    if(predictions.length === 0){
        alert("ไม่พบสินค้า");
        return;
    }

    const found = [];

    predictions.forEach(item => {

        found.push(item.class);

    });

    alert(
        "AI พบ:\n\n" +
        found.join("\n")
    );
}
