    let cart = [];

let products =
JSON.parse(localStorage.getItem("products")) || [];

let sales =
JSON.parse(localStorage.getItem("sales")) || [];

let todaySales =
Number(localStorage.getItem("todaySales")) || 0;

let todayOrders =
Number(localStorage.getItem("todayOrders")) || 0;

// ======================
// INIT
// ======================

document.addEventListener("DOMContentLoaded", () => {

    const addBtn =
    document.getElementById("addProductBtn");

    const resetBtn =
    document.getElementById("resetBtn");

    const backupBtn =
    document.getElementById("backupBtn");

    const restoreBtn =
    document.getElementById("restoreBtn");

    const restoreFile =
    document.getElementById("restoreFile");

    const searchInput =
    document.getElementById("searchInput");

    const cashBtn =
    document.getElementById("cashBtn");

    const transferBtn =
    document.getElementById("transferBtn");

    const continueShopBtn =
    document.getElementById("continueShopBtn");

    const clearCartBtn =
    document.getElementById("clearCartBtn");

    if(addBtn)
        addBtn.addEventListener("click", addProduct);

    if(resetBtn)
        resetBtn.addEventListener("click", resetAll);

    if(backupBtn)
        backupBtn.addEventListener("click", backupData);

    if(restoreBtn){
        restoreBtn.addEventListener("click", () => {
            restoreFile.click();
        });
    }

    if(restoreFile){
        restoreFile.addEventListener(
            "change",
            restoreData
        );
    }

    if(searchInput){
        searchInput.addEventListener(
            "input",
            searchProduct
        );
    }

if(cashBtn){
    cashBtn.addEventListener(
        "click",
        () => checkout("เงินสด")
    );
}

if(transferBtn){
    transferBtn.addEventListener(
        "click",
        () => checkout("เงินโอน")
    );
}

if(continueShopBtn){
    continueShopBtn.addEventListener(
        "click",
        () => {
            alert("เลือกสินค้าเพิ่มได้เลย");
        }
    );
}

if(clearCartBtn){
    clearCartBtn.addEventListener(
        "click",
        clearCart
    );
}

    renderProducts();
    renderCart();
    updateStats();
    updateSalesDashboard();
    renderSalesHistory();
});

// ======================
// SAVE
// ======================

function saveProducts(){

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );
}

// ======================
// DASHBOARD
// ======================

function updateStats(){

    const totalProducts =
    document.getElementById("totalProducts");

    if(totalProducts){
        totalProducts.textContent =
        products.length;
    }
}

function updateSalesDashboard(){

    const salesEl =
    document.getElementById("todaySales");

    const ordersEl =
    document.getElementById("todayOrders");

    if(salesEl){
        salesEl.textContent =
        todaySales.toLocaleString() +
        " บาท";
    }

    if(ordersEl){
        ordersEl.textContent =
        todayOrders;
    }
}

// ======================
// ADD PRODUCT
// ======================

function addProduct(){

    const name =
    prompt("ชื่อสินค้า");

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

// ======================
// PRODUCT LIST
// ======================

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
            style="width:150px">

            <h3>${p.name}</h3>

            <p>฿${p.price}</p>

            <p>
            คงเหลือ ${p.stock}
            </p>

            <button onclick="addToCart(${p.id})">
            🛒 เพิ่มเข้าตะกร้า
            </button>

            <button onclick="editProduct(${p.id})">
            ✏️ แก้ไข
            </button>

            <button onclick="deleteProduct(${p.id})">
            🗑️ ลบ
            </button>

        </div>
        `;
    });
}

// ======================
// CART
// ======================

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

    if(!cartList || !cartTotal)
        return;

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
            =
            ฿${subtotal}
        </div>
        `;
    });

    cartTotal.textContent = total;
}

// ======================
// CHECKOUT
// ======================

function checkout(method){

    if(cart.length === 0){

        alert("ไม่มีสินค้าในตะกร้า");
        return;
    }

    const ok = confirm(
        "ยืนยันการชำระเงิน\n\n" +
        "ช่องทาง: " + method +
        "\nยอดรวม: ฿" +
        document.getElementById("cartTotal").textContent
    );

    if(!ok){
        return;
    }

    let total = 0;

    cart.forEach(item => {

        total +=
        item.price * item.qty;

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

    sales.unshift({

        id: Date.now(),

        date:
        new Date()
        .toLocaleString("th-TH"),

        method,

        total,

        items:[...cart]
    });

    todaySales += total;
    todayOrders++;

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );

    localStorage.setItem(
        "todaySales",
        todaySales
    );

    localStorage.setItem(
        "todayOrders",
        todayOrders
    );

    saveProducts();

    cart = [];

    renderProducts();
    renderCart();
    updateSalesDashboard();
    renderSalesHistory();

    alert(
        "ชำระเงินสำเร็จ\n\n" +
        method +
        "\nยอด " +
        total +
        " บาท"
    );
}

// ======================
// SALES HISTORY
// ======================

function renderSalesHistory(){

    const el =
    document.getElementById("salesHistory");

    if(!el) return;

    if(sales.length === 0){

        el.innerHTML =
        "<p>ยังไม่มีประวัติการขาย</p>";

        return;
    }

    el.innerHTML = "";

    sales.forEach(s => {

        el.innerHTML += `
        <div class="sale-card">

            <b>${s.date}</b><br>

            ${s.method}<br>

            ฿${s.total}<br><br>

            <button
            onclick="deleteSale(${s.id})">
            ❌ ลบบิล
            </button>

        </div>
        `;
    });
}

// ======================
// CSV
// ======================

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

// ======================
// CLEAR DAILY
// ======================

function clearDailySales(){

    if(!confirm("ล้างยอดขายวันนี้?"))
        return;

    todaySales = 0;
    todayOrders = 0;

    localStorage.setItem(
        "todaySales",
        0
    );

    localStorage.setItem(
        "todayOrders",
        0
    );

    updateSalesDashboard();
}

// ======================
// EDIT
// ======================

function editProduct(id){

    const p =
    products.find(
        x => x.id === id
    );

    if(!p) return;

    p.name =
    prompt("ชื่อ", p.name)
    || p.name;

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

// ======================
// DELETE
// ======================

function deleteProduct(id){

    if(!confirm("ลบสินค้า?"))
        return;

    products =
    products.filter(
        p => p.id !== id
    );

    saveProducts();

    renderProducts();
    updateStats();
}

// ======================
// SEARCH
// ======================

function searchProduct(e){

    const keyword =
    e.target.value.toLowerCase();

    document
    .querySelectorAll(".product-card")
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

// ======================
// RESET
// ======================

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

// ======================
// BACKUP
// ======================

function backupData(){

    const blob =
    new Blob(
        [
            JSON.stringify(
                {products},
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

// ======================
// RESTORE
// ======================

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

            alert("โหลดสำเร็จ");

        }catch{

            alert("ไฟล์เสีย");
        }
    };

    reader.readAsText(file);
}

function clearCart(){

    if(
        !confirm(
            "ล้างสินค้าทั้งหมดในตะกร้า?"
        )
    ){
        return;
    }

    cart = [];

    renderCart();
}

function deleteSale(id){

    const sale =
    sales.find(
        s => s.id === id
    );

    if(!sale) return;

    if(
        !confirm(
            "ยกเลิกบิลนี้?"
        )
    ){
        return;
    }

    // คืนสต๊อกสินค้า

    sale.items.forEach(item => {

        const product =
        products.find(
            p => p.id === item.id
        );

        if(product){

            product.stock += item.qty;
        }
    });

    // หักยอดขายกลับ

    todaySales -= sale.total;

    if(todaySales < 0){
        todaySales = 0;
    }

    todayOrders--;

    if(todayOrders < 0){
        todayOrders = 0;
    }

    // ลบบิล

    sales = sales.filter(
        s => s.id !== id
    );

    // save

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );

    localStorage.setItem(
        "todaySales",
        todaySales
    );

    localStorage.setItem(
        "todayOrders",
        todayOrders
    );

    saveProducts();

    renderProducts();
    renderSalesHistory();
    updateSalesDashboard();

    alert("ลบบิลสำเร็จ");
}


