// ======================
// AI Sticker POS V1
// ======================

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

    const image = prompt(
        "URL รูปภาพ (เว้นว่างได้)"
    );

    const product = {

        id: Date.now(),

        name,

        price,

        stock,

        image:
        image ||
        "https://via.placeholder.com/300x300?text=Sticker"

    };

    products.push(product);

    saveProducts();

    renderProducts();

    updateStats();
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

            </div>

        </div>

        `;

    });

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
