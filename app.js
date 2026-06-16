let discountValue = 0;
let cart = [];

let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let todaySales = Number(localStorage.getItem("todaySales")) || 0;
let todayOrders = Number(localStorage.getItem("todayOrders")) || 0;

// ======================
// INIT
// ======================

document.addEventListener("DOMContentLoaded", () => {

    const addBtn = document.getElementById("addProductBtn");
    const resetBtn = document.getElementById("resetBtn");
    const backupBtn = document.getElementById("backupBtn");
    const restoreBtn = document.getElementById("restoreBtn");
    const restoreFile = document.getElementById("restoreFile");
    const searchInput = document.getElementById("searchInput");

    const cashBtn = document.getElementById("cashBtn");
    const transferBtn = document.getElementById("transferBtn");
    const continueShopBtn = document.getElementById("continueShopBtn");
    const clearCartBtn = document.getElementById("clearCartBtn");
   
    const discountBtn = document.getElementById("discountBtn");

    addBtn?.addEventListener("click", addProduct);
    resetBtn?.addEventListener("click", resetAll);
    backupBtn?.addEventListener("click", backupData);

    restoreBtn?.addEventListener("click", () => restoreFile.click());
    restoreFile?.addEventListener("change", restoreData);
    searchInput?.addEventListener("input", searchProduct);

    cashBtn?.addEventListener("click", () => checkout("เงินสด"));
    transferBtn?.addEventListener("click", () => checkout("เงินโอน"));
    continueShopBtn?.addEventListener("click", applyDiscount);
    clearCartBtn?.addEventListener("click", clearCart);

    renderProducts();
    renderCart();
    updateStats();
    updateSalesDashboard();
    renderSalesHistory();
});

// ======================
// SAVE
// ======================

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

// ======================
// STATS
// ======================

function updateStats() {
    const el = document.getElementById("totalProducts");
    if (el) el.textContent = products.length;
}

function updateSalesDashboard() {

    const salesEl = document.getElementById("todaySales");
    const ordersEl = document.getElementById("todayOrders");

    if (salesEl) salesEl.textContent = todaySales.toLocaleString() + " บาท";
    if (ordersEl) ordersEl.textContent = todayOrders;
}

// ======================
// ADD PRODUCT
// ======================

function addProduct() {

    const name = prompt("ชื่อสินค้า");
    if (!name) return;

    const price = Number(prompt("ราคา")) || 0;
    const stock = Number(prompt("จำนวนสต๊อก")) || 0;

    const imagePicker = document.getElementById("imagePicker");
    imagePicker.value = "";

    imagePicker.onchange = () => {

        const file = imagePicker.files[0];
        if (!file) return;

        const reader = new FileReader();

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

// ======================
// PRODUCTS
// ======================

function renderProducts() {

    const grid = document.getElementById("productGrid");
    if (!grid) return;

    grid.innerHTML = "";

    products.forEach(p => {

        grid.innerHTML += `
        <div class="product-card">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>฿${p.price}</p>
            <p>คงเหลือ ${p.stock}</p>

            <button onclick="addToCart(${p.id})">🛒 เพิ่ม</button>
            <button onclick="editProduct(${p.id})">✏️ แก้ไข</button>
            <button onclick="deleteProduct(${p.id})">🗑️ ลบ</button>
        </div>`;
    });
}

// ======================
// CART
// ======================

function addToCart(id) {

    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(i => i.id === id);

    if (existing) existing.qty++;
    else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1
        });
    }

    renderCart();
}

// ======================
// CART + DISCOUNT
// ======================

function calculateDiscountTotal(cart) {

    let totalQty = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalQty += item.qty;
        totalPrice += item.qty * item.price;
    });

    let sets = Math.floor(totalQty / 5);
    let remain = totalQty % 5;

    let promoTotal = (sets * 100) + (remain * 20);

    return {
        normal: totalPrice,
        discounted: promoTotal
    };
}

function renderCart() {

    const list = document.getElementById("cartList");
    const totalEl = document.getElementById("cartTotal");

    if (!list || !totalEl) return;

    list.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += item.qty * item.price;

        list.innerHTML += `
        <div>
            ${item.name} x ${item.qty} = ${item.qty * item.price}
        </div>`;
    });

    let finalTotal = total - discountValue;
    if (finalTotal < 0) finalTotal = 0;

    totalEl.textContent = finalTotal;
}

function applyDiscount() {

    if (cart.length === 0) {
        alert("ไม่มีสินค้าในตะกร้า");
        return;
    }

    discountValue += 15;

    renderCart();
}

// ======================
// CHECKOUT
// ======================

function checkout(method) {

    if (cart.length === 0) {
        alert("ไม่มีสินค้า");
        return;
    }

    const total = Number(document.getElementById("cartTotal").textContent);

    if (!confirm(`ยืนยันจ่าย ${total} บาท (${method})`)) return;

    cart.forEach(item => {

        const product = products.find(p => p.id === item.id);

        if (product) {
            product.stock -= item.qty;
            if (product.stock < 0) product.stock = 0;
        }
    });

    sales.unshift({
        id: Date.now(),
        date: new Date().toLocaleString("th-TH"),
        method,
        total,
        items: [...cart],
        discount: discountValue
    });

    todaySales += total;
    todayOrders++;

    localStorage.setItem("sales", JSON.stringify(sales));
    localStorage.setItem("todaySales", todaySales);
    localStorage.setItem("todayOrders", todayOrders);

    saveProducts();

    cart = [];
    discountValue = 0;

    renderProducts();
    renderCart();
    updateSalesDashboard();
    renderSalesHistory();

    alert("ชำระเงินสำเร็จ");
}

// ======================
// SALES
// ======================

function renderSalesHistory() {

    const el = document.getElementById("salesHistory");
    if (!el) return;

    el.innerHTML = "";

    sales.forEach(s => {

        el.innerHTML += `
        <div>
            ${s.date} | ${s.method} | ${s.total}
            <button onclick="deleteSale(${s.id})">ลบ</button>
        </div>`;
    });
}

// ======================
// DELETE SALE
// ======================

function deleteSale(id) {

    const s = sales.find(x => x.id === id);
    if (!s) return;

    if (!confirm("ลบบิล?")) return;

    // ลบบิล
    sales = sales.filter(x => x.id !== id);

    // บันทึกใหม่
    localStorage.setItem("sales", JSON.stringify(sales));

    // 🔥 RE-CALCULATE ทั้งหมด (สำคัญมาก)
    recalcToday();

    renderSalesHistory();
}

function recalcToday() {

    let total = 0;

    sales.forEach(s => {
        total += s.total;
    });

    todaySales = total;
    todayOrders = sales.length;

    localStorage.setItem("todaySales", todaySales);
    localStorage.setItem("todayOrders", todayOrders);

    updateSalesDashboard();
}

// ======================
// OTHER
// ======================

function searchProduct(e) {

    const key = e.target.value.toLowerCase();

    document.querySelectorAll(".product-card").forEach(card => {

        card.style.display =
            card.innerText.toLowerCase().includes(key)
                ? ""
                : "none";
    });
}

function resetAll() {
    if (!confirm("ลบทั้งหมด?")) return;

    products = [];
    saveProducts();
    renderProducts();
    updateStats();
}

function backupData() {

    const blob = new Blob([JSON.stringify({ products }, null, 2)], {
        type: "application/json"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
}

function restoreData(e) {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {

        const data = JSON.parse(ev.target.result);
        products = data.products || [];

        saveProducts();
        renderProducts();
        updateStats();

        alert("โหลดสำเร็จ");
    };

    reader.readAsText(file);
}

function clearCart() {
    cart = [];
    renderCart();
}

function editProduct(id) {

    const p = products.find(x => x.id === id);
    if (!p) return;

    p.name = prompt("ชื่อ", p.name) || p.name;
    p.price = Number(prompt("ราคา", p.price)) || p.price;
    p.stock = Number(prompt("สต๊อก", p.stock)) || p.stock;

    saveProducts();
    renderProducts();
}

function deleteProduct(id) {

    if (!confirm("ลบ?")) return;

    products = products.filter(p => p.id !== id);

    saveProducts();
    renderProducts();
    updateStats();
}

function exportCSV(){

    let csv =
    "วันที่,ช่องทาง,สินค้า,จำนวน,ยอดขาย\n";

    let cashTotal = 0;
    let transferTotal = 0;

    const productStats = {};

    sales.forEach(sale => {

        if(sale.method === "เงินสด"){
            cashTotal += sale.total;
        }

        if(sale.method === "เงินโอน"){
            transferTotal += sale.total;
        }

        sale.items.forEach(item => {

            csv +=
            `"${sale.date}","${sale.method}","${item.name}",${item.qty},${item.price * item.qty}\n`;

            if(!productStats[item.name]){

                productStats[item.name] = 0;
            }

            productStats[item.name] += item.qty;
        });
    });

    csv += "\n";
    csv += "===== สรุปยอดขาย =====\n";
    csv += `เงินสด,${cashTotal}\n`;
    csv += `เงินโอน,${transferTotal}\n`;
    csv += `ยอดรวม,${cashTotal + transferTotal}\n`;

    csv += "\n";
    csv += "===== สินค้าขายดี =====\n";
    csv += "สินค้า,จำนวนที่ขาย\n";

    Object.entries(productStats)
    .sort((a,b)=>b[1]-a[1])
    .forEach(([name,qty])=>{

        csv += `"${name}",${qty}\n`;
    });

    const blob =
    new Blob(
        [csv],
        {
            type:
            "text/csv;charset=utf-8;"
        }
    );

    const a =
    document.createElement("a");

    a.href =
    URL.createObjectURL(blob);

    const today =
    new Date()
    .toISOString()
    .slice(0,10);

    a.download =
    `sales-report-${today}.csv`;

    a.click();
}

function clearDailySales() {

    if (!confirm("ล้างยอดขายวันนี้?")) return;

    todaySales = 0;
    todayOrders = 0;
    sales = [];

    localStorage.setItem("todaySales", "0");
    localStorage.setItem("todayOrders", "0");
    localStorage.setItem("sales", JSON.stringify([]));

    updateSalesDashboard();
    renderSalesHistory();

    alert("ล้างยอดขายเรียบร้อย");
}

window.exportCSV = exportCSV;
window.clearDailySales = clearDailySales;

