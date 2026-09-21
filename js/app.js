const STORE_PHONE = "972599719401";
const PRODUCTS_KEY = "naqshaProducts";
const CART_KEY = "naqshaCart";

const defaultProducts = [
  {id:1,name:"جاكيت عصري",category:"clothes",categoryName:"الملابس",price:150,stock:8,sizes:["M","L","XL"],colors:["أسود","بيج","زيتي"],image:"images/clothes/jacet.jpg"},
  {id:2,name:"هودي برتقالي مميز",category:"clothes",categoryName:"الملابس",price:120,stock:6,sizes:["M","L","XL"],colors:["برتقالي","أسود"],image:""},
  {id:3,name:"طقم ملابس متكامل",category:"clothes",categoryName:"الملابس",price:250,stock:4,sizes:["M","L","XL"],colors:["بيج","أسود"],image:"images/clothes/full.jpg"},
  {id:4,name:"حذاء نايكي رياضي",category:"shoes",categoryName:"الأحذية",price:200,stock:7,sizes:["40","41","42","43"],colors:["أسود","أبيض"],image:"images/shoes/nike shoes.jpg"},
  {id:5,name:"حذاء أديداس كلاسيك",category:"shoes",categoryName:"الأحذية",price:180,stock:5,sizes:["40","41","42","43"],colors:["أسود","بني"],image:"images/shoes/adidaes shoes.jpg"},
  {id:6,name:"تشكيلة أحذية فاخرة",category:"shoes",categoryName:"الأحذية",price:220,stock:3,sizes:["41","42","43"],colors:["أسود","بيج"],image:"images/shoes/shoes fyll.jpg"},
  {id:7,name:"حقيبة أنيقة 1",category:"bags",categoryName:"الحقائب",price:90,stock:5,sizes:[],colors:[],image:"images/bag/bag1.jpg"},
  {id:8,name:"حقيبة أنيقة 2",category:"bags",categoryName:"الحقائب",price:110,stock:5,sizes:[],colors:[],image:"images/bag/bag2.jpg"},
  {id:9,name:"حقيبة أنيقة 3",category:"bags",categoryName:"الحقائب",price:130,stock:5,sizes:[],colors:[],image:"images/bag/bag3.jpg"},
  {id:10,name:"إكسسوار مميز 1",category:"accessories",categoryName:"الإكسسوارات",price:45,stock:10,sizes:[],colors:[],image:"images/accessories/accessories1.jpg"},
  {id:11,name:"إكسسوار مميز 2",category:"accessories",categoryName:"الإكسسوارات",price:55,stock:10,sizes:[],colors:[],image:"images/accessories/accessories2.jpg"},
  {id:12,name:"ساعة نسائية",category:"accessories",categoryName:"الإكسسوارات",price:160,stock:4,sizes:[],colors:[],image:"images/accessories/Watch girl.jpg"},
  {id:13,name:"ساعة رجالية",category:"accessories",categoryName:"الإكسسوارات",price:180,stock:4,sizes:[],colors:[],image:"images/accessories/Watch men.jpg"},
  {id:14,name:"سوار ساعات",category:"accessories",categoryName:"الإكسسوارات",price:70,stock:6,sizes:[],colors:[],image:"images/accessories/Watch copels.jpg"}
];

const SUPABASE_URL = "https://uacnpssruwrhhsmsnja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0iqwsODpmzEwIGHeggqaUw_30lpY68V";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let products = [];
let cart = loadCart();
let selectedProduct = null;
let selectedSize = "";
let selectedColor = "";
let selectedQuantity = 1;

async function loadProducts() {
  const { data, error } = await db.from("products").select("*").order("id", { ascending:true });
  if (error || !data || !data.length) return defaultProducts.map(p=>({...p,newArrival:p.newArrival ?? false,exclusiveOffer:p.exclusiveOffer ?? false}));
  return data.map(p=>({...p, categoryName:p.category_name || p.categoryName || categoryName(p.category), newArrival:p.new_arrival ?? p.newArrival ?? false, exclusiveOffer:p.exclusive_offer ?? p.exclusiveOffer ?? false}));
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function categoryName(category) {
  return {
    clothes: "الملابس",
    shoes: "الأحذية",
    bags: "الحقائب",
    accessories: "الإكسسوارات"
  }[category] || "منتجات";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function productVisual(product) {
  if (product.image) {
    return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`;
  }
  const icon = {clothes:"👕", shoes:"👟", bags:"👜", accessories:"✨"}[product.category] || "✦";
  return `<div class="product-placeholder">${icon}</div>`;
}

function renderProducts(filter = "all") {
  const container = document.getElementById("productsContainer");
  const title = document.getElementById("productsTitle");
  if (!container) return;

  const filtered = filter === "new"
    ? products.filter(p => p.newArrival === true)
    : filter === "all"
      ? products
      : products.filter(p => p.category === filter);

  title.textContent = filter === "new" ? "وصل حديثًا" : filter === "all" ? "جميع المنتجات" : `قسم ${categoryName(filter)}`;

  if (!filtered.length) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#667085;">لا توجد منتجات متوفرة في هذا القسم حاليًا.</div>`;
    return;
  }

  container.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">
        ${productVisual(product)}
        <span class="stock-badge">${product.stock > 0 ? `متوفر ${product.stock}` : "نفد المخزون"}</span>
      </div>
      <div class="product-info">
        <div class="product-category-tag">${escapeHtml(product.categoryName || categoryName(product.category))}</div>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="product-price">${Number(product.price).toLocaleString("ar-EG")} شيكل</div>
        <button class="btn-add-cart" type="button"
          onclick="openProductModal(${product.id})"
          ${product.stock <= 0 ? "disabled" : ""}>
          ${product.stock > 0 ? "اختيار وإضافة للسلة" : "نفد المخزون"}
        </button>
      </div>
    </article>
  `).join("");
}

function openProductModal(productId) {
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct || selectedProduct.stock <= 0) return;

  selectedSize = selectedProduct.sizes?.[0] || "بدون مقاس";
  selectedColor = selectedProduct.colors?.[0] || "بدون لون";
  selectedQuantity = 1;

  const modal = document.getElementById("productModal");
  const body = document.getElementById("productModalBody");

  body.innerHTML = `
    <div class="modal-product-image">${productVisual(selectedProduct)}</div>
    <div class="product-category-tag">${escapeHtml(selectedProduct.categoryName || categoryName(selectedProduct.category))}</div>
    <h2 style="color:var(--navy);margin-top:3px;">${escapeHtml(selectedProduct.name)}</h2>
    <div class="product-price">${Number(selectedProduct.price).toLocaleString("ar-EG")} شيكل</div>

    ${selectedProduct.sizes?.length ? `
      <div class="option-title">اختر المقاس</div>
      <div class="options" id="sizeOptions">
        ${selectedProduct.sizes.map((size, i) =>
          `<button type="button" class="option-btn ${i === 0 ? "selected" : ""}" onclick="selectSize(this, '${escapeHtml(size)}')">${escapeHtml(size)}</button>`
        ).join("")}
      </div>` : ""}

    ${selectedProduct.colors?.length ? `
      <div class="option-title">اختر اللون</div>
      <div class="options" id="colorOptions">
        ${selectedProduct.colors.map((color, i) =>
          `<button type="button" class="option-btn ${i === 0 ? "selected" : ""}" onclick="selectColor(this, '${escapeHtml(color)}')">${escapeHtml(color)}</button>`
        ).join("")}
      </div>` : ""}

    <div class="option-title">الكمية</div>
    <div class="quantity-control">
      <button type="button" onclick="changeModalQuantity(-1)">−</button>
      <span id="modalQuantity">1</span>
      <button type="button" onclick="changeModalQuantity(1)">+</button>
    </div>

    <button class="btn-primary full-btn" type="button" onclick="confirmAddToCart()">
      إضافة إلى السلة
    </button>
  `;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function selectSize(button, value) {
  selectedSize = value;
  document.querySelectorAll("#sizeOptions .option-btn").forEach(b => b.classList.remove("selected"));
  button.classList.add("selected");
}

function selectColor(button, value) {
  selectedColor = value;
  document.querySelectorAll("#colorOptions .option-btn").forEach(b => b.classList.remove("selected"));
  button.classList.add("selected");
}

function changeModalQuantity(delta) {
  if (!selectedProduct) return;
  selectedQuantity = Math.max(1, Math.min(selectedProduct.stock, selectedQuantity + delta));
  document.getElementById("modalQuantity").textContent = selectedQuantity;
}

function confirmAddToCart() {
  if (!selectedProduct) return;

  const existing = cart.find(item =>
    item.id === selectedProduct.id &&
    item.size === selectedSize &&
    item.color === selectedColor
  );

  if (existing) {
    existing.quantity = Math.min(selectedProduct.stock, existing.quantity + selectedQuantity);
  } else {
    cart.push({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: Number(selectedProduct.price),
      image: selectedProduct.image || "",
      size: selectedSize,
      color: selectedColor,
      quantity: selectedQuantity
    });
  }

  saveCart();
  updateCartCount();
  closeProductModal();
  showToast("تمت إضافة المنتج إلى السلة ✓");
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

function openCartModal() {
  renderCart();
  document.getElementById("cartModal").classList.add("open");
  document.getElementById("cartModal").setAttribute("aria-hidden", "false");
}

function closeCartModal() {
  document.getElementById("cartModal").classList.remove("open");
  document.getElementById("cartModal").setAttribute("aria-hidden", "true");
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
  document.getElementById("productModal").setAttribute("aria-hidden", "true");
  selectedProduct = null;
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const total = document.getElementById("cartTotal");

  if (!cart.length) {
    container.innerHTML = `<div class="empty-cart">🛒<br>السلة فارغة حاليًا.<br>اختر منتجاتك أولًا.</div>`;
    total.textContent = "0 شيكل";
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-image">
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : `<div class="product-placeholder">✦</div>`}
      </div>
      <div>
        <h4>${escapeHtml(item.name)}</h4>
        <small>المقاس: ${escapeHtml(item.size || "—")}</small>
        <small>اللون: ${escapeHtml(item.color || "—")}</small>
        <small>السعر: ${Number(item.price).toLocaleString("ar-EG")} شيكل</small>
        <div class="cart-item-actions">
          <button type="button" onclick="changeCartQuantity(${index}, -1)">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" onclick="changeCartQuantity(${index}, 1)">+</button>
          <button type="button" class="remove-item" onclick="removeCartItem(${index})">حذف</button>
        </div>
      </div>
      <strong>${(Number(item.price) * item.quantity).toLocaleString("ar-EG")} ₪</strong>
    </div>
  `).join("");

  total.textContent = `${cartTotal().toLocaleString("ar-EG")} شيكل`;
}

function changeCartQuantity(index, delta) {
  if (!cart[index]) return;

  const product = products.find(p => p.id === cart[index].id);
  const max = product ? Number(product.stock) : 99;

  cart[index].quantity += delta;
  if (cart[index].quantity > max) cart[index].quantity = max;

  if (cart[index].quantity <= 0) cart.splice(index, 1);

  saveCart();
  updateCartCount();
  renderCart();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

function checkout(event) {
  event.preventDefault();

  if (!cart.length) {
    showToast("السلة فارغة.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();

  if (!name || !phone) {
    showToast("يرجى إدخال الاسم ورقم الهاتف.");
    return;
  }

  // إنشاء فاتورة مرتبة وواضحة لواتساب
  const now = new Date();
  const orderDate = now.toLocaleDateString("ar-EG");
  const orderTime = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit"
  });

  let message = "";
  message += "🛍️ *AM store | طلب شراء جديد*\n";
  message += "━━━━━━━━━━━━━━━━━━━━\n\n";

  message += "👤 *بيانات الزبون*\n";
  message += `الاسم: ${name}\n`;
  message += `الهاتف: ${phone}\n`;
  message += `التاريخ: ${orderDate}\n`;
  message += `الوقت: ${orderTime}\n\n`;

  message += "📦 *تفاصيل الفاتورة*\n";
  message += "━━━━━━━━━━━━━━━━━━━━\n";

  cart.forEach((item, index) => {
    const unitPrice = Number(item.price);
    const itemTotal = unitPrice * item.quantity;

    message += `\n*${index + 1}. ${item.name}*\n`;
    message += `▫️ المقاس: ${item.size || "غير محدد"}\n`;
    message += `▫️ اللون: ${item.color || "غير محدد"}\n`;
    message += `▫️ الكمية: ${item.quantity}\n`;
    message += `▫️ سعر القطعة: ${unitPrice.toLocaleString("en-US")} شيكل\n`;
    message += `▫️ إجمالي المنتج: *${itemTotal.toLocaleString("en-US")} شيكل*\n`;
  });

  message += "\n━━━━━━━━━━━━━━━━━━━━\n";
  message += `💰 *إجمالي الفاتورة: ${cartTotal().toLocaleString("en-US")} شيكل*\n`;
  message += "📝 *ملاحظة: إجمالي الفاتورة لا يشمل رسوم الدليفري (التوصيل).*\n";
  message += "━━━━━━━━━━━━━━━━━━━━\n\n";
  message += "🚚 *ملاحظات الطلب*\n";
  message += "يرجى تأكيد الطلب وتزويدي بتفاصيل التوصيل والدفع.\n\n";
  message += "❤️ شكرًا لاختياركم *AM store*";

  const whatsappUrl =
    `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");

  cart = [];
  saveCart();
  updateCartCount();
  closeCartModal();
  document.getElementById("checkoutForm").reset();
  showToast("تم تجهيز الفاتورة وإرسالها إلى واتساب.");
}

function renderExclusiveOffers() {
  const container = document.getElementById("exclusiveProductsContainer");
  if (!container) return;

  const exclusive = products.filter(p => p.exclusiveOffer === true);
  if (!exclusive.length) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:35px;color:#667085;">سيتم إضافة العروض الحصرية قريبًا.</div>`;
    return;
  }

  container.innerHTML = exclusive.map(product => `
    <article class="product-card">
      <div class="product-image">
        ${productVisual(product)}
        <span class="stock-badge">عرض حصري</span>
      </div>
      <div class="product-info">
        <div class="product-category-tag">${escapeHtml(product.categoryName || categoryName(product.category))}</div>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="product-price">${Number(product.price).toLocaleString("ar-EG")} شيكل</div>
        <button class="btn-add-cart" type="button" onclick="openProductModal(${product.id})" ${product.stock <= 0 ? "disabled" : ""}>${product.stock > 0 ? "اختيار وإضافة للسلة" : "نفد المخزون"}</button>
      </div>
    </article>
  `).join("");
}

function filterProducts(filter) {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderProducts(filter);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.addEventListener("DOMContentLoaded", async () => {
  products = await loadProducts();
  renderProducts("new");
  renderExclusiveOffers();
  updateCartCount();

  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      filterProducts(card.dataset.category);
      document.getElementById("products").scrollIntoView({behavior:"smooth"});
    });
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => filterProducts(btn.dataset.filter));
  });

  document.getElementById("cartToggleBtn").addEventListener("click", openCartModal);
  document.getElementById("closeCartModal").addEventListener("click", closeCartModal);
  document.getElementById("closeProductModal").addEventListener("click", closeProductModal);
  document.getElementById("checkoutForm").addEventListener("submit", checkout);

  document.querySelectorAll(".modal-overlay").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.classList.remove("open");
    });
  });
});
