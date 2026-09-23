const PRODUCTS_KEY = "naqshaProducts";

const defaultProducts = [
  {
    id: 1,
    name: "جاكيت عصري",
    category: "clothes",
    categoryName: "الملابس",
    price: 150,
    stock: 8,
    sizes: ["M", "L", "XL"],
    colors: ["أسود", "بيج", "زيتي"],
    image: "images/clothes/jacet.jpg"
  },
  {
    id: 2,
    name: "هودي برتقالي مميز",
    category: "clothes",
    categoryName: "الملابس",
    price: 120,
    stock: 6,
    sizes: ["M", "L", "XL"],
    colors: ["برتقالي", "أسود"],
    image: ""
  },
  {
    id: 3,
    name: "طقم ملابس متكامل",
    category: "clothes",
    categoryName: "الملابس",
    price: 250,
    stock: 4,
    sizes: ["M", "L", "XL"],
    colors: ["بيج", "أسود"],
    image: "images/clothes/full.jpg"
  },
  {
    id: 4,
    name: "حذاء نايكي رياضي",
    category: "shoes",
    categoryName: "الأحذية",
    price: 200,
    stock: 7,
    sizes: ["40", "41", "42", "43"],
    colors: ["أسود", "أبيض"],
    image: "images/shoes/nike shoes.jpg"
  },
  {
    id: 5,
    name: "حذاء أديداس كلاسيك",
    category: "shoes",
    categoryName: "الأحذية",
    price: 180,
    stock: 5,
    sizes: ["40", "41", "42", "43"],
    colors: ["أسود", "بني"],
    image: "images/shoes/adidaes shoes.jpg"
  },
  {
    id: 6,
    name: "تشكيلة أحذية فاخرة",
    category: "shoes",
    categoryName: "الأحذية",
    price: 220,
    stock: 3,
    sizes: ["41", "42", "43"],
    colors: ["أسود", "بيج"],
    image: "images/shoes/shoes fyll.jpg"
  },
  {
    id: 7,
    name: "حقيبة أنيقة 1",
    category: "bags",
    categoryName: "الحقائب",
    price: 90,
    stock: 5,
    sizes: [],
    colors: [],
    image: "images/bag/bag1.jpg"
  },
  {
    id: 8,
    name: "حقيبة أنيقة 2",
    category: "bags",
    categoryName: "الحقائب",
    price: 110,
    stock: 5,
    sizes: [],
    colors: [],
    image: "images/bag/bag2.jpg"
  },
  {
    id: 9,
    name: "حقيبة أنيقة 3",
    category: "bags",
    categoryName: "الحقائب",
    price: 130,
    stock: 5,
    sizes: [],
    colors: [],
    image: "images/bag/bag3.jpg"
  },
  {
    id: 10,
    name: "إكسسوار مميز 1",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 45,
    stock: 10,
    sizes: [],
    colors: [],
    image: "images/accessories/accessories1.jpg"
  },
  {
    id: 11,
    name: "إكسسوار مميز 2",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 55,
    stock: 10,
    sizes: [],
    colors: [],
    image: "images/accessories/accessories2.jpg"
  },
  {
    id: 12,
    name: "ساعة نسائية",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 160,
    stock: 4,
    sizes: [],
    colors: [],
    image: "images/accessories/Watch girl.jpg"
  },
  {
    id: 13,
    name: "ساعة رجالية",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 180,
    stock: 4,
    sizes: [],
    colors: [],
    image: "images/accessories/Watch men.jpg"
  },
  {
    id: 14,
    name: "سوار ساعات",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 70,
    stock: 6,
    sizes: [],
    colors: [],
    image: "images/accessories/Watch copels.jpg"
  }
];


// ==================================================
// المتغيرات
// ==================================================

let products = [];
let currentUser = null;
let selectedCategory = "all";


// ==================================================
// الاتصال بقاعدة البيانات
// ==================================================

function getDb() {
  return window.supabaseClient;
}


// ==================================================
// أسماء الأقسام
// ==================================================

function categoryName(category) {
  const names = {
    clothes: "الملابس",
    shoes: "الأحذية",
    bags: "الحقائب",
    accessories: "الإكسسوارات"
  };

  return names[category] || "منتجات";
}


// ==================================================
// حماية النصوص
// ==================================================

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[char];
    }
  );
}


// ==================================================
// تحميل المنتجات من Supabase
// ==================================================

async function loadProducts() {

  const db = getDb();

  if (!db) {
    throw new Error(
      "لم يتم تهيئة Supabase"
    );
  }


  const {
    data,
    error
  } = await db
    .from("products")
    .select("*")
    .order("id", {
      ascending: true
    });


  if (error) {
    throw error;
  }


  return (data || []).map(
    (product) => ({

      ...product,

      categoryName:
        product.category_name ||
        categoryName(
          product.category
        ),

      // مهم:
      // true فقط تعني وصل حديثًا
      newArrival:
        product.new_arrival === true,

      // مهم:
      // true فقط تعني عرض حصري
      exclusiveOffer:
        product.exclusive_offer === true

    })
  );
}


// ==================================================
// حفظ المنتج
// ==================================================

async function saveProductToDb(
  data,
  editId
) {

  const db = getDb();

  if (!db) {
    throw new Error(
      "لم يتم تهيئة Supabase"
    );
  }


  const payload = {

    name: data.name,

    category:
      data.category,

    category_name:
      data.categoryName,

    price:
      data.price,

    stock:
      data.stock,

    sizes:
      data.sizes,

    colors:
      data.colors,

    image:
      data.image,

    // القيمة تكون true أو false فقط
    new_arrival:
      data.newArrival === true,

    // القيمة تكون true أو false فقط
    exclusive_offer:
      data.exclusiveOffer === true,

    updated_at:
      new Date().toISOString()

  };


  let result;


  if (editId) {

    result =
      await db
        .from("products")
        .update(payload)
        .eq(
          "id",
          Number(editId)
        );

  } else {

    result =
      await db
        .from("products")
        .insert(payload);

  }


  if (result.error) {
    throw result.error;
  }
}


// ==================================================
// رفع صورة المنتج
// ==================================================

async function uploadImage(file) {

  if (!file) {
    return "";
  }


  const db = getDb();

  if (!db) {
    throw new Error(
      "لم يتم تهيئة Supabase"
    );
  }


  const extension =
    (
      file.name
        .split(".")
        .pop() ||
      "jpg"
    ).toLowerCase();


  const filePath =
    `${crypto.randomUUID()}.${extension}`;


  const {
    error
  } =
    await db.storage
      .from("product-images")
      .upload(
        filePath,
        file,
        {
          upsert: false,

          contentType:
            file.type ||
            "image/jpeg"
        }
      );


  if (error) {
    throw error;
  }


  const {
    data
  } =
    db.storage
      .from("product-images")
      .getPublicUrl(
        filePath
      );


  return data.publicUrl;
}


// ==================================================
// إظهار لوحة التحكم
// ==================================================

function showPanel() {

  document
    .getElementById("loginBox")
    ?.classList.add(
      "hidden"
    );


  document
    .getElementById("adminPanel")
    ?.classList.remove(
      "hidden"
    );


  renderAdminProducts();
}


// ==================================================
// تسجيل الدخول
// ==================================================

async function login() {

  const emailElement =
    document.getElementById(
      "adminEmail"
    );


  const passwordElement =
    document.getElementById(
      "adminPassword"
    );


  const errorBox =
    document.getElementById(
      "loginError"
    );


  if (
    !emailElement ||
    !passwordElement
  ) {
    return;
  }


  const email =
    emailElement.value.trim();


  const password =
    passwordElement.value;


  if (errorBox) {
    errorBox.textContent = "";
  }


  const db = getDb();


  if (!db) {

    if (errorBox) {

      errorBox.textContent =
        "خطأ في الاتصال بقاعدة البيانات. تأكد من تحميل config.js.";

    }

    return;
  }


  try {

    // تسجيل الدخول
    const {
      data,
      error
    } =
      await db.auth
        .signInWithPassword({
          email,
          password
        });


    if (error) {

      if (errorBox) {
        errorBox.textContent =
          "بيانات الدخول غير صحيحة.";
      }

      return;
    }


    // التحقق من أن المستخدم أدمن
    const {
      data: adminRow,
      error: adminError
    } =
      await db
        .from("admin_users")
        .select("user_id")
        .eq(
          "user_id",
          data.user.id
        )
        .maybeSingle();


    if (adminError) {
      throw adminError;
    }


    if (!adminRow) {

      await db.auth.signOut();


      if (errorBox) {

        errorBox.textContent =
          "هذا الحساب غير مخول لإدارة المتجر.";

      }

      return;
    }


    currentUser =
      data.user;


    products =
      await loadProducts();


    // ==================================================
    // زرع المنتجات الافتراضية فقط إذا كانت القاعدة فارغة
    // ==================================================

    if (!products.length) {

      const seed =
        defaultProducts.map(
          (product) => ({

            name:
              product.name,

            category:
              product.category,

            category_name:
              product.categoryName,

            price:
              product.price,

            stock:
              product.stock,

            sizes:
              product.sizes,

            colors:
              product.colors,

            image:
              product.image,

            // مهم جدًا:
            // المنتجات الافتراضية ليست "وصل حديثًا"
            new_arrival:
              false,

            // وليست عروضًا حصرية
            exclusive_offer:
              false

          })
        );


      const {
        data: seededData,
        error: seedError
      } =
        await db
          .from("products")
          .insert(seed)
          .select("*");


      if (seedError) {
        throw seedError;
      }


      products =
        (seededData || []).map(
          (product) => ({

            ...product,

            categoryName:
              product.category_name,

            newArrival:
              product.new_arrival === true,

            exclusiveOffer:
              product.exclusive_offer === true

          })
        );
    }


    showPanel();

  } catch (error) {

    console.error(
      "خطأ تسجيل الدخول:",
      error
    );


    if (errorBox) {

      errorBox.textContent =
        "تعذر تحميل المنتجات. تأكد من الجداول والصلاحيات.";

    }


    await db.auth.signOut();
  }
}


// ==================================================
// تسجيل الخروج
// ==================================================

async function logout() {

  const db = getDb();

  if (db?.auth) {
    await db.auth.signOut();
  }

  location.reload();
}


// ==================================================
// حفظ منتج
// ==================================================

async function saveProduct(event) {

  event.preventDefault();


  const editId =
    document.getElementById(
      "editId"
    ).value;


  const existing =
    editId
      ? products.find(
          (product) =>
            product.id ===
            Number(editId)
        )
      : null;


  try {

    const imageInput =
      document.getElementById(
        "productImage"
      );


    let uploadedImage = "";


    // إذا اختار المستخدم صورة جديدة
    if (
      imageInput &&
      imageInput.files &&
      imageInput.files.length
    ) {

      uploadedImage =
        await uploadImage(
          imageInput.files[0]
        );

    }


    const category =
      document.getElementById(
        "productCategory"
      ).value;


    const data = {

      name:
        document
          .getElementById(
            "productName"
          )
          .value
          .trim(),

      category:

        category,

      categoryName:

        categoryName(
          category
        ),

      price:

        Number(
          document
            .getElementById(
              "productPrice"
            )
            .value
        ),

      stock:

        Number(
          document
            .getElementById(
              "productStock"
            )
            .value
        ),

      sizes:

        document
          .getElementById(
            "productSizes"
          )
          .value
          .split(",")
          .map(
            (value) =>
              value.trim()
          )
          .filter(Boolean),

      colors:

        document
          .getElementById(
            "productColors"
          )
          .value
          .split(",")
          .map(
            (value) =>
              value.trim()
          )
          .filter(Boolean),


      // الحالة الحالية الحقيقية
      newArrival:

        document
          .getElementById(
            "productNewArrival"
          )
          .checked === true,


      // الحالة الحالية الحقيقية
      exclusiveOffer:

        document
          .getElementById(
            "productExclusiveOffer"
          )
          .checked === true,


      // عند تعديل المنتج بدون صورة جديدة
      // نحتفظ بالصورة القديمة
      image:

        uploadedImage ||
        existing?.image ||
        ""

    };


    // التحقق من البيانات

    if (
      !data.name ||
      !Number.isFinite(
        data.price
      ) ||
      data.price < 0 ||
      !Number.isFinite(
        data.stock
      ) ||
      data.stock < 0
    ) {

      alert(
        "يرجى إدخال بيانات صحيحة."
      );

      return;
    }


    await saveProductToDb(
      data,
      editId
    );


    // إعادة تحميل البيانات من Supabase
    products =
      await loadProducts();


    resetForm();

    renderAdminProducts();


    alert(
      "تم حفظ المنتج بنجاح."
    );


  } catch (error) {

    console.error(
      "خطأ حفظ المنتج:",
      error
    );


    alert(
      "تعذر حفظ المنتج. تأكد من Storage والصلاحيات."
    );
  }
}


// ==================================================
// تعديل منتج
// ==================================================

function editProduct(id) {

  const product =
    products.find(
      (item) =>
        item.id === id
    );


  if (!product) {
    return;
  }


  document
    .getElementById(
      "formTitle"
    ).textContent =
      "تعديل المنتج";


  document
    .getElementById(
      "editId"
    ).value =
      product.id;


  document
    .getElementById(
      "productName"
    ).value =
      product.name || "";


  document
    .getElementById(
      "productCategory"
    ).value =
      product.category ||
      "clothes";


  document
    .getElementById(
      "productPrice"
    ).value =
      product.price ?? "";


  document
    .getElementById(
      "productStock"
    ).value =
      product.stock ?? "";


  document
    .getElementById(
      "productSizes"
    ).value =
      (
        product.sizes || []
      ).join(",");


  document
    .getElementById(
      "productColors"
    ).value =
      (
        product.colors || []
      ).join(",");


  // ==================================================
  // الإصلاح المهم
  // ==================================================
  // لا نستخدم:
  // product.newArrival !== false
  //
  // لأن ذلك يجعل null أو undefined
  // يعتبر "وصل حديثًا".
  //
  // نستخدم true فقط.
  // ==================================================

  document
    .getElementById(
      "productNewArrival"
    ).checked =
      product.newArrival === true;


  document
    .getElementById(
      "productExclusiveOffer"
    ).checked =
      product.exclusiveOffer === true;


  // لا نحذف الصورة القديمة عند التعديل
  document
    .getElementById(
      "productImage"
    ).value = "";


  const cancelButton =
    document.getElementById(
      "cancelEditBtn"
    );


  if (cancelButton) {
    cancelButton.style.display =
      "inline-block";
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ==================================================
// حذف المنتج
// ==================================================

async function deleteProduct(id) {

  const product =
    products.find(
      (item) =>
        item.id === id
    );


  if (!product) {
    return;
  }


  const confirmed =
    confirm(
      `هل تريد حذف "${product.name}"؟`
    );


  if (!confirmed) {
    return;
  }


  try {

    const db = getDb();


    const {
      error
    } =
      await db
        .from("products")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {
      throw error;
    }


    products =
      products.filter(
        (item) =>
          item.id !== id
      );


    renderAdminProducts();


  } catch (error) {

    console.error(
      "خطأ حذف المنتج:",
      error
    );


    alert(
      "تعذر حذف المنتج."
    );
  }
}


// ==================================================
// تبديل حالة العرض الحصري
// ==================================================

async function toggleExclusiveOffer(id) {

  const product =
    products.find(
      (item) =>
        item.id === id
    );


  if (!product) {
    return;
  }


  try {

    const db = getDb();


    const newValue =
      product.exclusiveOffer !== true;


    const {
      error
    } =
      await db
        .from("products")
        .update({

          exclusive_offer:
            newValue,

          updated_at:
            new Date()
              .toISOString()

        })
        .eq(
          "id",
          id
        );


    if (error) {
      throw error;
    }


    products =
      await loadProducts();


    renderAdminProducts();


  } catch (error) {

    console.error(
      "خطأ تحديث العرض:",
      error
    );


    alert(
      "تعذر تحديث المنتج."
    );
  }
}


// ==================================================
// تبديل حالة وصل حديثًا
// ==================================================

async function toggleNewArrival(id) {

  const product =
    products.find(
      (item) =>
        item.id === id
    );


  if (!product) {
    return;
  }


  try {

    const db = getDb();


    const newValue =
      product.newArrival !== true;


    const {
      error
    } =
      await db
        .from("products")
        .update({

          new_arrival:
            newValue,

          updated_at:
            new Date()
              .toISOString()

        })
        .eq(
          "id",
          id
        );


    if (error) {
      throw error;
    }


    products =
      await loadProducts();


    renderAdminProducts();


  } catch (error) {

    console.error(
      "خطأ تحديث وصل حديثًا:",
      error
    );


    alert(
      "تعذر تحديث المنتج."
    );
  }
}


// ==================================================
// إعادة نموذج المنتج
// ==================================================

function resetForm() {

  const form =
    document.getElementById(
      "productForm"
    );


  if (form) {
    form.reset();
  }


  const editId =
    document.getElementById(
      "editId"
    );


  if (editId) {
    editId.value = "";
  }


  const formTitle =
    document.getElementById(
      "formTitle"
    );


  if (formTitle) {

    formTitle.textContent =
      "إضافة منتج جديد";

  }


  const cancelButton =
    document.getElementById(
      "cancelEditBtn"
    );


  if (cancelButton) {

    cancelButton.style.display =
      "none";

  }
}


// ==================================================
// عرض المنتجات في لوحة الأدمن
// ==================================================

function renderAdminProducts() {

  const container =
    document.getElementById(
      "adminProducts"
    );


  if (!container) {
    return;
  }


  let list = [];


  // جميع المنتجات
  if (
    selectedCategory ===
    "all"
  ) {

    list = products;

  }


  // وصل حديثًا
  else if (
    selectedCategory ===
    "new"
  ) {

    list =
      products.filter(
        (product) =>
          product.newArrival === true
      );

  }


  // العروض الحصرية
  else if (
    selectedCategory ===
    "exclusive"
  ) {

    list =
      products.filter(
        (product) =>
          product.exclusiveOffer === true
      );

  }


  // الأقسام العادية
  else {

    list =
      products.filter(
        (product) =>
          product.category ===
          selectedCategory
      );

  }


  if (!list.length) {

    container.innerHTML = `
      <p
        style="
          grid-column:1/-1;
          text-align:center;
          color:#667085;
        "
      >
        لا توجد منتجات.
      </p>
    `;

    return;
  }


  container.innerHTML =
    list
      .map(
        (product) => `

          <article class="admin-product">

            ${
              product.image

                ? `
                  <img
                    src="${escapeHtml(
                      product.image
                    )}"
                    alt="${escapeHtml(
                      product.name
                    )}"
                  >
                `

                : `
                  <div class="no-img">
                    ✦
                  </div>
                `
            }


            <div class="admin-product-info">

              <h3>
                ${escapeHtml(
                  product.name
                )}
              </h3>


              <p>
                ${escapeHtml(
                  product.categoryName ||
                  categoryName(
                    product.category
                  )
                )}
              </p>


              <p>

                ${
                  product.newArrival === true
                    ? "✓ وصل حديثًا"
                    : ""
                }

                ${
                  product.exclusiveOffer === true
                    ? " ✓ عرض حصري"
                    : ""
                }

              </p>


              <p>
                السعر:
                <strong>
                  ${product.price}
                  شيكل
                </strong>

                —

                المخزون:
                <strong>
                  ${product.stock}
                </strong>
              </p>


              <p>
                المقاسات:
                ${
                  (
                    product.sizes ||
                    []
                  ).join("، ") ||
                  "—"
                }
              </p>


              <p>
                الألوان:
                ${
                  (
                    product.colors ||
                    []
                  ).join("، ") ||
                  "—"
                }
              </p>


              <div
                class="admin-product-actions"
              >

                <button
                  type="button"
                  onclick="editProduct(
                    ${product.id}
                  )"
                >
                  تعديل
                </button>


                <button
                  type="button"
                  onclick="toggleExclusiveOffer(
                    ${product.id}
                  )"
                >
                  ${
                    product.exclusiveOffer === true
                      ? "إزالة من العروض"
                      : "إضافة للعروض"
                  }
                </button>


                <button
                  type="button"
                  onclick="deleteProduct(
                    ${product.id}
                  )"
                  style="color:#A61B1B"
                >
                  حذف
                </button>

              </div>


              <div
                class="admin-product-actions"
              >

                <button
                  type="button"
                  onclick="toggleNewArrival(
                    ${product.id}
                  )"
                >
                  ${
                    product.newArrival === true
                      ? "إزالة من وصل حديثًا"
                      : "إضافة لوصل حديثًا"
                  }
                </button>

              </div>

            </div>

          </article>

        `
      )
      .join("");
}


// ==================================================
// تشغيل لوحة الأدمن
// ==================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    // زر تسجيل الدخول
    document
      .getElementById(
        "loginBtn"
      )
      ?.addEventListener(
        "click",
        login
      );


    // الضغط Enter في كلمة المرور
    document
      .getElementById(
        "adminPassword"
      )
      ?.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key ===
            "Enter"
          ) {

            login();

          }

        }
      );


    // تسجيل الخروج
    document
      .getElementById(
        "logoutBtn"
      )
      ?.addEventListener(
        "click",
        logout
      );


    // نموذج المنتج
    document
      .getElementById(
        "productForm"
      )
      ?.addEventListener(
        "submit",
        saveProduct
      );


    // إلغاء التعديل
    document
      .getElementById(
        "cancelEditBtn"
      )
      ?.addEventListener(
        "click",
        resetForm
      );


    // ==================================================
    // تبويبات الأقسام
    // ==================================================

    document
      .querySelectorAll(
        ".category-tab"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              selectedCategory =
                button.dataset.category;


              document
                .querySelectorAll(
                  ".category-tab"
                )
                .forEach(
                  (tab) =>
                    tab.classList.remove(
                      "active"
                    )
                );


              button.classList.add(
                "active"
              );


              renderAdminProducts();

            }
          );

        }
      );


    // ==================================================
    // التحقق من الجلسة الحالية
    // ==================================================

    const db =
      getDb();


    if (
      db?.auth
    ) {

      try {

        const {
          data
        } =
          await db.auth.getSession();


        if (
          data?.session
        ) {

          const {
            data: adminRow,
            error
          } =
            await db
              .from(
                "admin_users"
              )
              .select(
                "user_id"
              )
              .eq(
                "user_id",
                data.session
                  .user.id
              )
              .maybeSingle();


          if (error) {
            throw error;
          }


          if (adminRow) {

            currentUser =
              data.session.user;


            products =
              await loadProducts();


            showPanel();

          }

        }

      } catch (error) {

        console.error(
          "خطأ التحقق من الجلسة:",
          error
        );

      }

    }

  }
);
