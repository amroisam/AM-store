const PRODUCTS_KEY = "naqshaProducts";

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
let currentUser = null;
let selectedCategory = "all";

function categoryName(category) { return {clothes:"الملابس",shoes:"الأحذية",bags:"الحقائب",accessories:"الإكسسوارات"}[category] || "منتجات"; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#039;"}[c])); }
async function loadProducts() {
 const {data,error}=await db.from("products").select("*").order("id",{ascending:true});
 if(error) throw error;
 return (data||[]).map(p=>({...p,categoryName:p.category_name||categoryName(p.category),newArrival:p.new_arrival ?? false,exclusiveOffer:p.exclusive_offer ?? false}));
}
async function saveProductToDb(data,editId) {
 const payload={name:data.name,category:data.category,category_name:data.categoryName,price:data.price,stock:data.stock,sizes:data.sizes,colors:data.colors,image:data.image,new_arrival:data.newArrival,exclusive_offer:data.exclusiveOffer,updated_at:new Date().toISOString()};
 const result=editId ? await db.from("products").update(payload).eq("id",Number(editId)) : await db.from("products").insert(payload);
 if(result.error) throw result.error;
}
async function uploadImage(file) {
 if(!file) return "";
 const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
 const path=`${crypto.randomUUID()}.${ext}`;
 const {error}=await db.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});
 if(error) throw error;
 return db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
function showPanel() { document.getElementById("loginBox").classList.add("hidden"); document.getElementById("adminPanel").classList.remove("hidden"); renderAdminProducts(); }
async function login() {
 const email=document.getElementById("adminEmail").value.trim(), password=document.getElementById("adminPassword").value, errorBox=document.getElementById("loginError"); errorBox.textContent="";
 const {data,error}=await db.auth.signInWithPassword({email,password});
 if(error){errorBox.textContent="بيانات الدخول غير صحيحة.";return;}
 const {data:adminRow}=await db.from("admin_users").select("user_id").eq("user_id",data.user.id).maybeSingle();
 if(!adminRow){await db.auth.signOut();errorBox.textContent="هذا الحساب غير مخول لإدارة المتجر.";return;}
 currentUser=data.user;
 try { products=await loadProducts(); if(!products.length){const seed=defaultProducts.map(({id,categoryName,newArrival=true,exclusiveOffer=false,...rest})=>({...rest,category_name:categoryName,new_arrival:newArrival,exclusive_offer:exclusiveOffer})); const seeded=await db.from("products").insert(seed).select("*"); if(seeded.error) throw seeded.error; products=seeded.data.map(p=>({...p,categoryName:p.category_name,newArrival:p.new_arrival,exclusiveOffer:p.exclusive_offer}));} showPanel(); } catch(e){console.error(e);errorBox.textContent="تعذر تحميل المنتجات. نفّذ ملف إعداد Storage وتأكد من الجداول.";await db.auth.signOut();}
}
async function logout() { await db.auth.signOut(); location.reload(); }
async function saveProduct(event) {
 event.preventDefault(); const editId=document.getElementById("editId").value; const existing=editId?products.find(p=>p.id===Number(editId)):null;
 try { const uploaded=await uploadImage(document.getElementById("productImage").files[0]); const data={name:document.getElementById("productName").value.trim(),category:document.getElementById("productCategory").value,categoryName:categoryName(document.getElementById("productCategory").value),price:Number(document.getElementById("productPrice").value),stock:Number(document.getElementById("productStock").value),sizes:document.getElementById("productSizes").value.split(",").map(v=>v.trim()).filter(Boolean),colors:document.getElementById("productColors").value.split(",").map(v=>v.trim()).filter(Boolean),newArrival:document.getElementById("productNewArrival").checked,exclusiveOffer:document.getElementById("productExclusiveOffer").checked,image:uploaded||existing?.image||""}; if(!data.name||data.price<0||data.stock<0){alert("يرجى إدخال بيانات صحيحة.");return;} await saveProductToDb(data,editId); products=await loadProducts(); resetForm(); renderAdminProducts(); alert("تم حفظ المنتج بنجاح."); } catch(e){console.error(e);alert("تعذر حفظ المنتج. تأكد من إعداد Storage والصلاحيات.");}
}
function editProduct(id) { const p=products.find(x=>x.id===id); if(!p)return; document.getElementById("formTitle").textContent="تعديل المنتج";document.getElementById("editId").value=p.id;document.getElementById("productName").value=p.name;document.getElementById("productCategory").value=p.category;document.getElementById("productPrice").value=p.price;document.getElementById("productStock").value=p.stock;document.getElementById("productSizes").value=(p.sizes||[]).join(",");document.getElementById("productColors").value=(p.colors||[]).join(",");document.getElementById("productNewArrival").checked=p.newArrival!==false;document.getElementById("productExclusiveOffer").checked=p.exclusiveOffer===true;document.getElementById("productImage").value="";document.getElementById("cancelEditBtn").style.display="inline-block";window.scrollTo({top:0,behavior:"smooth"}); }
async function deleteProduct(id) { const p=products.find(x=>x.id===id); if(!p||!confirm(`هل تريد حذف "${p.name}"؟`))return; try{const r=await db.from("products").delete().eq("id",id);if(r.error)throw r.error;products=products.filter(x=>x.id!==id);renderAdminProducts();}catch(e){alert("تعذر حذف المنتج.");} }
async function toggleExclusiveOffer(id) { const p=products.find(x=>x.id===id);if(!p)return;try{const r=await db.from("products").update({exclusive_offer:!p.exclusiveOffer,updated_at:new Date().toISOString()}).eq("id",id);if(r.error)throw r.error;products=await loadProducts();renderAdminProducts();}catch(e){alert("تعذر تحديث المنتج.");} }
async function toggleNewArrival(id) { const p=products.find(x=>x.id===id);if(!p)return;try{const r=await db.from("products").update({new_arrival:p.newArrival===false,updated_at:new Date().toISOString()}).eq("id",id);if(r.error)throw r.error;products=await loadProducts();renderAdminProducts();}catch(e){alert("تعذر تحديث المنتج.");} }
function resetForm() { document.getElementById("productForm").reset();document.getElementById("editId").value="";document.getElementById("formTitle").textContent="إضافة منتج جديد";document.getElementById("cancelEditBtn").style.display="none"; }
function renderAdminProducts() { const c=document.getElementById("adminProducts"); if(!c)return; const list=selectedCategory==="all"?products:selectedCategory==="new"?products.filter(p=>p.newArrival!==false):selectedCategory==="exclusive"?products.filter(p=>p.exclusiveOffer===true):products.filter(p=>p.category===selectedCategory); if(!list.length){c.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#667085;">لا توجد منتجات.</p>';return;} c.innerHTML=list.map(p=>`<article class="admin-product">${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">`:'<div class="no-img">✦</div>'}<div class="admin-product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.categoryName||categoryName(p.category))}</p><p>${p.newArrival!==false?'✓ وصل حديثًا':''} ${p.exclusiveOffer?'✓ عرض حصري':''}</p><p>السعر: <strong>${p.price} شيكل</strong> — المخزون: <strong>${p.stock}</strong></p><p>المقاسات: ${(p.sizes||[]).join('، ')||'—'}</p><p>الألوان: ${(p.colors||[]).join('، ')||'—'}</p><div class="admin-product-actions"><button type="button" onclick="editProduct(${p.id})">تعديل</button><button type="button" onclick="toggleExclusiveOffer(${p.id})">${p.exclusiveOffer?'إزالة من العروض':'إضافة للعروض'}</button><button type="button" onclick="deleteProduct(${p.id})" style="color:#A61B1B">حذف</button></div><div class="admin-product-actions"><button type="button" onclick="toggleNewArrival(${p.id})">${p.newArrival!==false?'إزالة من وصل حديثًا':'إضافة لوصل حديثًا'}</button></div></div></article>`).join(''); }
document.addEventListener("DOMContentLoaded",async()=>{ document.getElementById("loginBtn").addEventListener("click",login);document.getElementById("adminPassword").addEventListener("keydown",e=>{if(e.key==='Enter')login();});document.getElementById("logoutBtn").addEventListener("click",logout);document.getElementById("productForm").addEventListener("submit",saveProduct);document.getElementById("cancelEditBtn").addEventListener("click",resetForm);document.querySelectorAll(".category-tab").forEach(b=>b.addEventListener("click",()=>{selectedCategory=b.dataset.category;document.querySelectorAll(".category-tab").forEach(t=>t.classList.remove("active"));b.classList.add("active");renderAdminProducts();})); const {data}=await db.auth.getSession();if(data.session){const {data:row}=await db.from("admin_users").select("user_id").eq("user_id",data.session.user.id).maybeSingle();if(row){currentUser=data.session.user;try{products=await loadProducts();showPanel();}catch(e){}}} });
