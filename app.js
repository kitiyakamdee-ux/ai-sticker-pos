let cart = [];
let products = JSON.parse(localStorage.getItem("products")) || [];

document.addEventListener("DOMContentLoaded", () => {

const addBtn = document.getElementById("addProductBtn");
const resetBtn = document.getElementById("resetBtn");
const backupBtn = document.getElementById("backupBtn");
const restoreBtn = document.getElementById("restoreBtn");
const restoreFile = document.getElementById("restoreFile");
const searchInput = document.getElementById("searchInput");
const checkoutBtn = document.getElementById("checkoutBtn");

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

if(searchInput){
    searchInput.addEventListener("input", searchProduct);
}

if(checkoutBtn){
    checkoutBtn.addEventListener("click", checkout);
}

renderProducts();
updateStats();
renderCart();

});

function saveProducts(){
localStorage.setItem(
"products",
JSON.stringify(products)
);
}

function updateStats(){

const totalProducts =
document.getElementById("totalProducts");

if(totalProducts){
    totalProducts.textContent =
    products.length;
}

}

function addProduct(){

const name = prompt("ชื่อสินค้า");
if(!name) return;

const price =
Number(prompt("ราคา")) || 0;

const stock =
Number(prompt("จำนวนสต๊อก")) || 0;

const imagePicker =
document.getElementById("imagePicker");

imagePicker.value = "";

imagePicker.onchange = () => {

    const file =
    imagePicker.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload = (e) => {

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

function renderProducts(){

const grid =
document.getElementById("productGrid");

if(!grid) return;

grid.innerHTML = "";

products.forEach(p => {

    grid.innerHTML += `
    <div class="product-card">

        <img
        src="${p.image}"
        style="
        width:100%;
        max-width:150px;
        ">

        <h3>${p.name}</h3>

        <p>฿${p.price}</p>

        <p>
        คงเหลือ ${p.stock}
        </p>

        <button
        onclick="addToCart(${p.id})">
        🛒 เพิ่มเข้าตะกร้า
        </button>

        <button
        onclick="editProduct(${p.id})">
        ✏️ แก้ไข
        </button>

        <button
        onclick="deleteProduct(${p.id})">
        🗑️ ลบ
        </button>

    </div>
    `;
});

}

function addToCart(id){

const product =
products.find(
    p => p.id === id
);

if(!product) return;

const existing =
cart.find(
    item => item.id === id
);

if(existing){

    existing.qty++;

}else{

    cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1
    });
}

renderCart();

}

function renderCart(){

const cartList =
document.getElementById("cartList");

const cartTotal =
document.getElementById("cartTotal");

if(!cartList || !cartTotal) return;

cartList.innerHTML = "";

let total = 0;

cart.forEach(item => {

    const subtotal =
    item.price * item.qty;

    total += subtotal;

    cartList.innerHTML += `
    <div>
        ${item.name}
        x ${item.qty}
        = ฿${subtotal}
    </div>
    `;
});

cartTotal.textContent = total;

}

function checkout(){

if(cart.length === 0){

    alert("ไม่มีสินค้าในตะกร้า");
    return;
}

cart.forEach(item => {

    const product =
    products.find(
        p => p.id === item.id
    );

    if(product){

        product.stock -= item.qty;

        if(product.stock < 0){
            product.stock = 0;
        }
    }
});

saveProducts();

cart = [];

renderProducts();
renderCart();

alert("ชำระเงินสำเร็จ");

}

function editProduct(id){

const p =
products.find(
    x => x.id === id
);

if(!p) return;

p.name =
prompt(
    "ชื่อสินค้า",
    p.name
) || p.name;

p.price =
Number(
    prompt(
        "ราคา",
        p.price
    )
) || p.price;

p.stock =
Number(
    prompt(
        "สต๊อก",
        p.stock
    )
) || p.stock;

saveProducts();
renderProducts();

}

function deleteProduct(id){

if(!confirm("ลบสินค้า?")){
    return;
}

products =
products.filter(
    p => p.id !== id
);

saveProducts();
renderProducts();
updateStats();

}

function searchProduct(e){

const keyword =
e.target.value.toLowerCase();

document
.querySelectorAll(
    ".product-card"
)
.forEach(card => {

    const text =
    card.innerText
    .toLowerCase();

    card.style.display =
    text.includes(keyword)
    ? ""
    : "none";
});

}

function resetAll(){

if(
    !confirm(
        "ลบสินค้าทั้งหมด?"
    )
){
    return;
}

products = [];

saveProducts();
renderProducts();
updateStats();

}

function backupData(){

const blob =
new Blob(
    [
        JSON.stringify(
            { products },
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
"backup.json";

a.click();

}

function restoreData(e){

const file =
e.target.files[0];

if(!file) return;

const reader =
new FileReader();

reader.onload = (ev) => {

    try{

        const data =
        JSON.parse(
            ev.target.result
        );

        products =
        data.products || [];

        saveProducts();
        renderProducts();
        updateStats();

        alert(
            "โหลดสำเร็จ"
        );

    }catch{

        alert(
            "ไฟล์เสีย"
        );
    }
};

reader.readAsText(file);

}
