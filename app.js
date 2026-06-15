// ======================
// AI Sticker POS V1
// ======================

alert("APP JS VERSION NEW");

let products = JSON.parse(
    localStorage.getItem("products")
) || [];

// โหลดหน้า
renderProducts();
updateStats();

// ======================
// ปุ่มเพิ่มสินค้า
// ======================

document
.getElementById("addProductBtn")
.addEventListener("click", addProduct);

function addProduct(){

    const name = prompt("ชื่อสินค้า");

    if(!name) return;

    const price = Number(
        prompt("ราคา")
    );

    const stock = Number(
        prompt("จำนวนสต๊อก")
    );

    const imagePicker =
    document.getElementById(
        "imagePicker"
    );

    imagePicker.value = "";

    imagePicker.onchange = function(){

        const file =
        imagePicker.files[0];

        if(!file) return;

        const reader =
        new FileReader();

        reader.onload = function(e){

            const product = {

                id: Date.now(),

                name,

                price,

                stock,

                image: e.target.result

            };

            products.push(product);

            saveProducts();

            renderProducts();

            updateStats();

        };

        reader.readAsDataURL(file);

    };

    imagePicker.click();

}

// ======================
// Save
// ======================

function saveProducts(){

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );
}

// ======================
// Dashboard
// ======================

function updateStats(){

    document.getElementById(
        "totalProducts"
    ).textContent = products.length;
}

// ======================
// Render
// ======================

function renderProducts(){

    const grid =
    document.getElementById(
        "productGrid"
    );

    grid.innerHTML = "";

    products.forEach(product => {

        grid.innerHTML += `

        <div class="product-card">

            <img
            src="${product.image}"
            alt="${product.name}"
            >

            <div class="product-info">

                <div class="product-name">
                    ${product.name}
                </div>

                <div class="product-price">
                    ฿${product.price}
                </div>

                <div class="product-stock">
                คงเหลือ ${product.stock}
                </div>

                <button
                class="edit-btn"
                onclick="editProduct(${product.id})"
                >
                ✏️ แก้ไข
                </button>

                <button
                class="delete-btn"
                onclick="deleteProduct(${product.id})"
                >
                🗑️ ลบสินค้า
                </button>

            </div>

        </div>

        `;

    });

}

function deleteProduct(id){

    const confirmDelete = confirm(
        "ต้องการลบสินค้านี้หรือไม่?"
    );

    if(!confirmDelete) return;

    products = products.filter(
        product => product.id !== id
    );

    saveProducts();

    renderProducts();

    updateStats();

}

// ======================
// Search
// ======================

document
.getElementById("searchInput")
.addEventListener("input", e => {

    const keyword =
    e.target.value.toLowerCase();

    const cards =
    document.querySelectorAll(
        ".product-card"
    );

    cards.forEach(card => {

        const text =
        card.innerText.toLowerCase();

        card.style.display =
        text.includes(keyword)
        ? "block"
        : "none";

    });

});

document
.getElementById("resetBtn")
.addEventListener("click", resetAll);

function resetAll(){

    if(
        !confirm(
            "ลบข้อมูลสินค้าทั้งหมดหรือไม่?"
        )
    ) return;

    products = [];

    saveProducts();

    renderProducts();

    updateStats();

}

function editProduct(id){

    const product =
    products.find(
        p => p.id === id
    );

    if(!product) return;

    const newName =
    prompt(
        "ชื่อสินค้า",
        product.name
    );

    if(!newName) return;

    const newPrice =
    Number(
        prompt(
            "ราคา",
            product.price
        )
    );

    const newStock =
    Number(
        prompt(
            "สต๊อก",
            product.stock
        )
    );

    product.name = newName;
    product.price = newPrice;
    product.stock = newStock;

    saveProducts();

    renderProducts();

}

document
.getElementById("backupBtn")
.addEventListener(
    "click",
    backupData
);

function backupData(){

    const data = {

        products

    };

    const blob =
    new Blob(
        [
            JSON.stringify(
                data,
                null,
                2
            )
        ],
        {
            type:
            "application/json"
        }
    );

    const a =
    document.createElement("a");

    a.href =
    URL.createObjectURL(blob);

    a.download =
    "ai-sticker-pos-backup.json";

    a.click();

}

document
.getElementById(
    "restoreBtn"
)
.addEventListener(
    "click",
    () => {

        document
        .getElementById(
            "restoreFile"
        )
        .click();

    }
);

document
.getElementById(
    "restoreFile"
)
.addEventListener(
    "change",
    restoreData
);

function restoreData(e){

    const file =
    e.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload =
    function(event){

        const data =
        JSON.parse(
            event.target.result
        );

        products =
        data.products || [];

        saveProducts();

        renderProducts();

        updateStats();

        alert(
            "โหลด Backup สำเร็จ"
        );

    };

    reader.readAsText(file);

}

// ======================
// Camera
// ======================

let cameraStream = null;

document
.getElementById("cameraBtn")
.addEventListener(
    "click",
    startCamera
);

async function startCamera(){

    try{

        const video =
        document.getElementById(
            "camera"
        );

        cameraStream =
        await navigator
        .mediaDevices
        .getUserMedia({

            video:{
                facingMode:"environment"
            }

        });

        video.srcObject =
        cameraStream;

        video.style.display =
        "block";

    }
    catch(error){

        alert(
            "เปิดกล้องไม่ได้"
        );

        console.error(error);

    }

}

// ======================
// Capture
// ======================

document
.getElementById("captureBtn")
.addEventListener(
    "click",
    captureBasket
);

function captureBasket(){

    const video =
    document.getElementById(
        "camera"
    );

    if(!video.srcObject){

        alert(
            "กรุณาเปิดกล้องก่อน"
        );

        return;

    }

    const canvas =
    document.createElement(
        "canvas"
    );

    canvas.width =
    video.videoWidth;

    canvas.height =
    video.videoHeight;

    const ctx =
    canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0
    );

    const imageData =
    canvas.toDataURL(
        "image/jpeg",
        0.8
    );

    const img =
    document.getElementById(
        "capturedImage"
    );

    img.src =
    imageData;

    img.style.display =
    "block";

    localStorage.setItem(
        "lastBasketPhoto",
        imageData
    );

    alert(
        "ถ่ายภาพสำเร็จ"
    );

}


