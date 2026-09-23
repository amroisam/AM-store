const STORE_PHONE = "972599719401";
const CART_KEY = "naqshaCart";

const SUPABASE_URL = "https://uacnpssrurwhrshmsnja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_0iqwsODpmzEwIGHeggqaUw_30lpY68V";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let products = [];
let cart = loadCart();

let selectedProduct = null;
let selectedSize = "";
let selectedColor = "";
let selectedQuantity = 1;


// ===============================
// تحميل المنتجات
// ===============================

async function loadProducts() {
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("خطأ في تحميل المنتجات:", error);

    return [];
  }

  return (data || []).map((product) => ({
    ...product,

    categoryName:
      product.category_name ||
      categoryName(product.category),

    // مهم جدًا:
    // المنتج يعتبر "وصل حديثًا" فقط إذا كانت القيمة true
    newArrival: product.new_arrival === true,

    // المنتج يعتبر "عرض حصري" فقط إذا كانت القيمة true
    exclusiveOffer: product.exclusive_offer === true,
  }));
}


// ===============================
// أسماء الأقسام
// ===============================

function categoryName(category) {
  const names = {
    clothes: "الملابس",
    shoes: "الأحذية",
    bags: "الحقائب",
    accessories: "الإكسسوارات",
  };

  return names[category] || "منتجات";
}


// ===============================
// حماية النصوص
// ===============================

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}


// ===============================
// السلة
// ===============================

function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY)
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}


function saveCart() {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );
}


function updateCartCount() {
  const cartCount =
    document.getElementById("cartCount");

  if (!cartCount) return;

  cartCount.textContent = cart.reduce(
    (total, item) =>
      total + Number(item.quantity),
    0
  );
}


// ===============================
// صورة المنتج
// ===============================

function productVisual(product) {
  if (product.image) {
    return `
      <img
        src="${escapeHtml(product.image)}"
        alt="${escapeHtml(product.name)}"
        loading="lazy"
      >
    `;
  }

  const icons = {
    clothes: "👕",
    shoes: "👟",
    bags: "👜",
    accessories: "✨",
  };

  return `
    <div class="product-placeholder">
      ${icons[product.category] || "✦"}
    </div>
  `;
}


// ===============================
// عرض المنتجات
// ===============================

function renderProducts(filter = "all") {
  const container =
    document.getElementById("productsContainer");

  const title =
    document.getElementById("productsTitle");

  if (!container) return;

  let filteredProducts = products;

  // جميع المنتجات
  if (filter === "all") {
    filteredProducts = products;
  }

  // وصل حديثًا
  else if (filter === "new") {
    filteredProducts = products.filter(
      (product) =>
        product.newArrival === true
    );
  }

  // قسم معين
  else {
    filteredProducts = products.filter(
      (product) =>
        product.category === filter
    );
  }


  if (title) {
    if (filter === "all") {
      title.textContent = "جميع المنتجات";
    }

    else if (filter === "new") {
      title.textContent = "وصل حديثًا";
    }

    else {
      title.textContent =
        `قسم ${categoryName(filter)}`;
    }
  }


  if (!filteredProducts.length) {
    container.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:40px;
          color:#667085;
        "
      >
        لا توجد منتجات متوفرة في هذا القسم حاليًا.
      </div>
    `;

    return;
  }


  container.innerHTML =
    filteredProducts
      .map((product) => {

        const stock =
          Number(product.stock || 0);

        return `
          <article class="product-card">

            <div class="product-image">

              ${productVisual(product)}

              <span class="stock-badge">
                ${
                  stock > 0
                    ? `متوفر ${stock}`
                    : "نفد المخزون"
                }
              </span>

            </div>


            <div class="product-info">

              <div class="product-category-tag">
                ${escapeHtml(
                  product.categoryName ||
                  categoryName(product.category)
                )}
              </div>

              <h3>
                ${escapeHtml(product.name)}
              </h3>

              <div class="product-price">
                ${Number(product.price).toLocaleString("ar-EG")}
                شيكل
              </div>


              <button
                class="btn-add-cart"
                type="button"
                onclick="openProductModal(${product.id})"
                ${stock <= 0 ? "disabled" : ""}
              >
                ${
                  stock > 0
                    ? "اختيار وإضافة للسلة"
                    : "نفد المخزون"
                }
              </button>

            </div>

          </article>
        `;
      })
      .join("");
}


// ===============================
// نافذة المنتج
// ===============================

function openProductModal(productId) {

  selectedProduct =
    products.find(
      (product) =>
        product.id === productId
    );

  if (!selectedProduct) return;

  if (Number(selectedProduct.stock) <= 0) {
    return;
  }


  selectedSize =
    selectedProduct.sizes?.[0] ||
    "بدون مقاس";

  selectedColor =
    selectedProduct.colors?.[0] ||
    "بدون لون";

  selectedQuantity = 1;


  const modal =
    document.getElementById("productModal");

  const body =
    document.getElementById(
      "productModalBody"
    );

  if (!modal || !body) return;


  body.innerHTML = `

    <div class="modal-product-image">
      ${productVisual(selectedProduct)}
    </div>


    <div class="product-category-tag">
      ${escapeHtml(
        selectedProduct.categoryName ||
        categoryName(selectedProduct.category)
      )}
    </div>


    <h2>
      ${escapeHtml(selectedProduct.name)}
    </h2>


    <div class="product-price">
      ${Number(
        selectedProduct.price
      ).toLocaleString("ar-EG")}
      شيكل
    </div>


    ${
      selectedProduct.sizes?.length
        ? `
          <div class="option-title">
            اختر المقاس
          </div>

          <div
            class="options"
            id="sizeOptions"
          >
            ${selectedProduct.sizes
              .map(
                (size, index) => `
                  <button
                    type="button"
                    class="option-btn ${
                      index === 0
                        ? "selected"
                        : ""
                    }"
                    onclick="selectSize(
                      this,
                      '${escapeHtml(size)}'
                    )"
                  >
                    ${escapeHtml(size)}
                  </button>
                `
              )
              .join("")}
          </div>
        `
        : ""
    }


    ${
      selectedProduct.colors?.length
        ? `
          <div class="option-title">
            اختر اللون
          </div>

          <div
            class="options"
            id="colorOptions"
          >
            ${selectedProduct.colors
              .map(
                (color, index) => `
                  <button
                    type="button"
                    class="option-btn ${
                      index === 0
                        ? "selected"
                        : ""
                    }"
                    onclick="selectColor(
                      this,
                      '${escapeHtml(color)}'
                    )"
                  >
                    ${escapeHtml(color)}
                  </button>
                `
              )
              .join("")}
          </div>
        `
        : ""
    }


    <div class="option-title">
      الكمية
    </div>


    <div class="quantity-control">

      <button
        type="button"
        onclick="changeModalQuantity(-1)"
      >
        −
      </button>

      <span id="modalQuantity">
        1
      </span>

      <button
        type="button"
        onclick="changeModalQuantity(1)"
      >
        +
      </button>

    </div>


    <button
      class="btn-primary full-btn"
      type="button"
      onclick="confirmAddToCart()"
    >
      إضافة إلى السلة
    </button>

  `;


  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}


// ===============================
// اختيار المقاس
// ===============================

function selectSize(button, value) {

  selectedSize = value;

  document
    .querySelectorAll(
      "#sizeOptions .option-btn"
    )
    .forEach((btn) =>
      btn.classList.remove("selected")
    );

  button.classList.add("selected");
}


// ===============================
// اختيار اللون
// ===============================

function selectColor(button, value) {

  selectedColor = value;

  document
    .querySelectorAll(
      "#colorOptions .option-btn"
    )
    .forEach((btn) =>
      btn.classList.remove("selected")
    );

  button.classList.add("selected");
}


// ===============================
// كمية المنتج
// ===============================

function changeModalQuantity(delta) {

  if (!selectedProduct) return;

  const stock =
    Number(selectedProduct.stock);

  selectedQuantity =
    Math.max(
      1,
      Math.min(
        stock,
        selectedQuantity + delta
      )
    );

  const quantityElement =
    document.getElementById(
      "modalQuantity"
    );

  if (quantityElement) {
    quantityElement.textContent =
      selectedQuantity;
  }
}


// ===============================
// إضافة للسلة
// ===============================

function confirmAddToCart() {

  if (!selectedProduct) return;


  const existing =
    cart.find(
      (item) =>
        item.id === selectedProduct.id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );


  if (existing) {

    existing.quantity =
      Math.min(
        Number(selectedProduct.stock),
        existing.quantity +
          selectedQuantity
      );

  } else {

    cart.push({

      id: selectedProduct.id,

      name: selectedProduct.name,

      price:
        Number(selectedProduct.price),

      image:
        selectedProduct.image || "",

      size: selectedSize,

      color: selectedColor,

      quantity:
        selectedQuantity,
    });

  }


  saveCart();

  updateCartCount();

  closeProductModal();

  showToast(
    "تمت إضافة المنتج إلى السلة ✓"
  );
}


// ===============================
// نافذة السلة
// ===============================

function openCartModal() {

  renderCart();

  const modal =
    document.getElementById(
      "cartModal"
    );

  if (!modal) return;

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeCartModal() {

  const modal =
    document.getElementById(
      "cartModal"
    );

  if (!modal) return;

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


function closeProductModal() {

  const modal =
    document.getElementById(
      "productModal"
    );

  if (!modal) return;

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  selectedProduct = null;
}


// ===============================
// إجمالي السلة
// ===============================

function cartTotal() {

  return cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
      Number(item.quantity),

    0
  );
}


// ===============================
// عرض السلة
// ===============================

function renderCart() {

  const container =
    document.getElementById(
      "cartItems"
    );

  const total =
    document.getElementById(
      "cartTotal"
    );

  if (!container || !total) return;


  if (!cart.length) {

    container.innerHTML = `
      <div class="empty-cart">
        🛒
        <br>
        السلة فارغة حاليًا.
        <br>
        اختر منتجاتك أولًا.
      </div>
    `;

    total.textContent =
      "0 شيكل";

    return;
  }


  container.innerHTML =
    cart.map(
      (item, index) => `

        <div class="cart-item">

          <div class="cart-item-image">

            ${
              item.image
                ? `
                  <img
                    src="${escapeHtml(item.image)}"
                    alt="${escapeHtml(item.name)}"
                  >
                `
                : `
                  <div class="product-placeholder">
                    ✦
                  </div>
                `
            }

          </div>


          <div>

            <h4>
              ${escapeHtml(item.name)}
            </h4>

            <small>
              المقاس:
              ${escapeHtml(item.size || "—")}
            </small>

            <small>
              اللون:
              ${escapeHtml(item.color || "—")}
            </small>

            <small>
              السعر:
              ${Number(item.price).toLocaleString("ar-EG")}
              شيكل
            </small>


            <div class="cart-item-actions">

              <button
                type="button"
                onclick="changeCartQuantity(${index}, -1)"
              >
                −
              </button>

              <strong>
                ${item.quantity}
              </strong>

              <button
                type="button"
                onclick="changeCartQuantity(${index}, 1)"
              >
                +
              </button>

              <button
                type="button"
                class="remove-item"
                onclick="removeCartItem(${index})"
              >
                حذف
              </button>

            </div>

          </div>


          <strong>
            ${(
              Number(item.price) *
              Number(item.quantity)
            ).toLocaleString("ar-EG")}
            ₪
          </strong>

        </div>

      `
    ).join("");


  total.textContent =
    `${cartTotal().toLocaleString("ar-EG")} شيكل`;
}


// ===============================
// تغيير كمية داخل السلة
// ===============================

function changeCartQuantity(
  index,
  delta
) {

  if (!cart[index]) return;


  const product =
    products.find(
      (p) =>
        p.id === cart[index].id
    );


  const max =
    product
      ? Number(product.stock)
      : 99;


  cart[index].quantity += delta;


  if (
    cart[index].quantity >
    max
  ) {
    cart[index].quantity =
      max;
  }


  if (
    cart[index].quantity <= 0
  ) {
    cart.splice(index, 1);
  }


  saveCart();

  updateCartCount();

  renderCart();
}


// ===============================
// حذف من السلة
// ===============================

function removeCartItem(index) {

  cart.splice(index, 1);

  saveCart();

  updateCartCount();

  renderCart();
}


// ===============================
// العروض الحصرية
// ===============================

function renderExclusiveOffers() {

  const container =
    document.getElementById(
      "exclusiveProductsContainer"
    );

  if (!container) return;


  const exclusiveProducts =
    products.filter(
      (product) =>
        product.exclusiveOffer === true
    );


  if (!exclusiveProducts.length) {

    container.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:35px;
          color:#667085;
        "
      >
        سيتم إضافة العروض الحصرية قريبًا.
      </div>
    `;

    return;
  }


  container.innerHTML =
    exclusiveProducts
      .map(
        (product) => `

          <article class="product-card">

            <div class="product-image">

              ${productVisual(product)}

              <span class="stock-badge">
                عرض حصري
              </span>

            </div>


            <div class="product-info">

              <div class="product-category-tag">
                ${escapeHtml(
                  product.categoryName ||
                  categoryName(product.category)
                )}
              </div>

              <h3>
                ${escapeHtml(product.name)}
              </h3>

              <div class="product-price">
                ${Number(product.price).toLocaleString("ar-EG")}
                شيكل
              </div>


              <button
                class="btn-add-cart"
                type="button"
                onclick="openProductModal(${product.id})"
                ${
                  Number(product.stock) <= 0
                    ? "disabled"
                    : ""
                }
              >
                ${
                  Number(product.stock) > 0
                    ? "اختيار وإضافة للسلة"
                    : "نفد المخزون"
                }
              </button>

            </div>

          </article>

        `
      )
      .join("");
}


// ===============================
// الفلاتر
// ===============================

function filterProducts(filter) {

  document
    .querySelectorAll(".filter-btn")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.filter ===
          filter
      );

    });


  renderProducts(filter);
}


// ===============================
// رسالة صغيرة
// ===============================

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      2600
    );
}


// ===============================
// الفاتورة وواتساب
// ===============================

function checkout(event) {

  event.preventDefault();


  if (!cart.length) {

    showToast(
      "السلة فارغة."
    );

    return;
  }


  const name =
    document
      .getElementById(
        "customerName"
      )
      ?.value.trim();


  const phone =
    document
      .getElementById(
        "customerPhone"
      )
      ?.value.trim();


  if (!name || !phone) {

    showToast(
      "يرجى إدخال الاسم ورقم الهاتف."
    );

    return;
  }


  const now =
    new Date();


  const orderDate =
    now.toLocaleDateString(
      "ar-EG"
    );


  const orderTime =
    now.toLocaleTimeString(
      "ar-EG",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );


  let message =
    "🛍️ *AM store | طلب شراء جديد*\n";

  message +=
    "━━━━━━━━━━━━━━━━━━━━\n\n";

  message +=
    "👤 *بيانات الزبون*\n";

  message +=
    `الاسم: ${name}\n`;

  message +=
    `الهاتف: ${phone}\n`;

  message +=
    `التاريخ: ${orderDate}\n`;

  message +=
    `الوقت: ${orderTime}\n\n`;

  message +=
    "📦 *تفاصيل الفاتورة*\n";

  message +=
    "━━━━━━━━━━━━━━━━━━━━\n";


  cart.forEach(
    (item, index) => {

      const itemTotal =
        Number(item.price) *
        Number(item.quantity);


      message +=
        `\n*${index + 1}. ${item.name}*\n`;

      message +=
        `▫️ المقاس: ${
          item.size || "غير محدد"
        }\n`;

      message +=
        `▫️ اللون: ${
          item.color || "غير محدد"
        }\n`;

      message +=
        `▫️ الكمية: ${
          item.quantity
        }\n`;

      message +=
        `▫️ سعر القطعة: ${
          Number(item.price).toLocaleString("en-US")
        } شيكل\n`;

      message +=
        `▫️ إجمالي المنتج: *${
          itemTotal.toLocaleString("en-US")
        } شيكل*\n`;

    }
  );


  message +=
    "\n━━━━━━━━━━━━━━━━━━━━\n";


  message +=
    `💰 *إجمالي الفاتورة: ${
      cartTotal().toLocaleString("en-US")
    } شيكل*\n`;


  message +=
    "📝 *ملاحظة: إجمالي الفاتورة دون حساب الدليفري.*\n";


  message +=
    "━━━━━━━━━━━━━━━━━━━━\n\n";


  message +=
    "🚚 *ملاحظات الطلب*\n";


  message +=
    "يرجى تأكيد الطلب وتزويدي بتفاصيل التوصيل والدفع.\n\n";


  message +=
    "❤️ شكرًا لاختياركم *AM store*";


  window.open(
    `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`,
    "_blank"
  );


  cart = [];

  saveCart();

  updateCartCount();

  closeCartModal();

  document
    .getElementById(
      "checkoutForm"
    )
    ?.reset();


  showToast(
    "تم تجهيز الفاتورة وإرسالها إلى واتساب."
  );
}


// ===============================
// عند تحميل الصفحة
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      products =
        await loadProducts();

    } catch (error) {

      console.error(
        "تعذر تحميل المنتجات:",
        error
      );

      products = [];

    }


    // مهم:
    // الصفحة الرئيسية تبدأ بجميع المنتجات
    // وليس بوصل حديثًا.
    filterProducts("all");


    // تحميل العروض الحصرية
    renderExclusiveOffers();


    // تحديث عداد السلة
    updateCartCount();


    // أقسام المتجر
    document
      .querySelectorAll(
        ".category-card"
      )
      .forEach((card) => {

        card.addEventListener(
          "click",
          () => {

            const category =
              card.dataset.category;

            filterProducts(
              category
            );


            document
              .getElementById(
                "products"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",
              });

          }
        );

      });


    // أزرار الفلاتر
    document
      .querySelectorAll(
        ".filter-btn"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () =>
            filterProducts(
              button.dataset.filter
            )
        );

      });


    document
      .getElementById(
        "cartToggleBtn"
      )
      ?.addEventListener(
        "click",
        openCartModal
      );


    document
      .getElementById(
        "closeCartModal"
      )
      ?.addEventListener(
        "click",
        closeCartModal
      );


    document
      .getElementById(
        "closeProductModal"
      )
      ?.addEventListener(
        "click",
        closeProductModal
      );


    document
      .getElementById(
        "checkoutForm"
      )
      ?.addEventListener(
        "submit",
        checkout
      );


    // إغلاق النوافذ عند الضغط خارجها
    document
      .querySelectorAll(
        ".modal-overlay"
      )
      .forEach((modal) => {

        modal.addEventListener(
          "click",
          (event) => {

            if (
              event.target ===
              modal
            ) {
              modal.classList.remove(
                "open"
              );
            }

          }
        );

      });

  }
);
