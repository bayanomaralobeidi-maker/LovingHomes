// ملف الجافاسكربت الرئيسي - Loving Homes

// متغيرات عامة
let fontSize = 100;
let isDarkMode = false;
let isTextSpacing = false;
// قراءة حالة المؤشر من localStorage أو افتراضياً مفعل
let isCursorDog = localStorage.getItem('dogCursor') !== null ? localStorage.getItem('dogCursor') === 'true' : true;

// دالة فتح وإغلاق تفاصيل الخدمات في صفحة المرافق
function initServiceDetails() {
    const moreIndicators = document.querySelectorAll('.more-indicator');
    
    moreIndicators.forEach(indicator => {
        indicator.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // الحصول على العنصر الأب (service-box)
            const serviceBox = this.closest('.service-box');
            
            // تبديل الكلاس على العنصر الأب
            serviceBox.classList.toggle('details-open');
            
            // تبديل الكلاس على العنصر الحالي (للتأثيرات)
            this.classList.toggle('active');
        });
    });
}

// تحميل الإعدادات المحفوظة عند بدء الصفحة
function loadSavedSettings() {
    // تحميل حجم الخط
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        fontSize = parseInt(savedFontSize);
        document.documentElement.style.fontSize = fontSize + '%';
        document.body.style.fontSize = fontSize + '%';
        const sizeDisplay = document.getElementById('sizeDisplay');
        if (sizeDisplay) {
            sizeDisplay.textContent = fontSize + '%';
        }
    }
    
    // تحميل تباعد النصوص
    const savedTextSpacing = localStorage.getItem('textSpacing');
    if (savedTextSpacing === 'true') {
        isTextSpacing = true;
        document.body.classList.add('text-spacing');
        const spacingToggle = document.getElementById('spacingToggle');
        if (spacingToggle) {
            spacingToggle.checked = true;
        }
    }
    
    // تحميل الوضع الداكن
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        const darkToggle = document.getElementById('darkToggle');
        if (darkToggle) {
            darkToggle.checked = true;
        }
    }
}

// تشغيل تحميل الإعدادات المحفوظة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadSavedSettings();
    updateAccessibilityIndicator();
    initServiceDetails();
});

// دالة تغيير شريحة صالة الحلاقة
function changeSlide(btn, direction) {
    const slider = btn.closest('.salon-slider');
    const images = slider.querySelectorAll('.salon-image');
    let currentIndex = 0;
    
   
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            currentIndex = index;
            img.classList.remove('active');
        }
    });
    
   
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;
    
   
    images[nextIndex].classList.add('active');
}

// دالة لتحديث مؤشر امكانيات الوصول
function updateAccessibilityIndicator() {
    const btn = document.querySelector('.floating-access-btn');
    if (!btn) return;
    
    // التحقق مما إذا كان أي إعداد نشط
    const hasActiveFeature = 
        fontSize !== 100 || 
        isDarkMode || 
        isTextSpacing || 
        isCursorDog;
    
    if (hasActiveFeature) {
        btn.classList.add('has-active');
    } else {
        btn.classList.remove('has-active');
    }
}

// =====================
// سلة التسوق - Shopping Cart
// =====================
let cart = JSON.parse(localStorage.getItem('dogHotelCart')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || false;

// تحديث حالة المستخدم عند تحميل الصفحة
function updateUserStatus() {
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        if (isLoggedIn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
            loginBtn.title = 'تسجيل الخروج';
        } else {
            loginBtn.innerHTML = '<i class="fas fa-user"></i>';
            loginBtn.title = 'تسجيل الدخول';
        }
    }
}

// استدعاء تحديث حالة المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateUserStatus();
});

// تحديث عداد السلة
function updateCartCount() {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = cart.length;
    }
}

// إضافة منتج للسلة
function addToCart(productName, productPrice) {
    // التحقق من تسجيل الدخول
    if (!isLoggedIn) {
        showNotification('يرجى تسجيل الدخول أولاً لإضافة المنتجات للسلة');
        showLogin();
        return;
    }
    
    // البحث عن المنتج في السلة
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        // عرض نافذة تأكيد مخصصة
        showCartConfirmModal(productName, existingItem.quantity, function(confirmed) {
            if (confirmed) {
                existingItem.quantity += 1;
                localStorage.setItem('dogHotelCart', JSON.stringify(cart));
                updateCartCount();
                showNotification(`تمت إضافة وحدة أخرى من "${productName}" (الكمية: ${existingItem.quantity}) ✓`);
            }
        });
        return;
    }
    
    // إضافة منتج جديد للسلة
    cart.push({
        name: productName,
        price: productPrice,
        quantity: 1
    });
    
    // حفظ في localStorage
    localStorage.setItem('dogHotelCart', JSON.stringify(cart));
    
    // تحديث عداد السلة
    updateCartCount();
    
    // إشعار للمستخدم
    showNotification('تمت إضافة المنتج للسلة ✓');
}

// نافذة تأكيد إضافة منتج مكرر
function showCartConfirmModal(productName, currentQuantity, callback) {
    // إنشاء عناصر النافذة
    const overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    
    modal.innerHTML = `
        <div class="confirm-modal-icon">
            <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>المنتج موجود مسبقاً</h3>
        <p>"<strong>${productName}</strong>" موجود بالفعل في السلة</p>
        <p class="confirm-quantity">الكمية الحالية: <span>${currentQuantity}</span></p>
        <p class="confirm-question">هل تريد إضافة وحدة أخرى؟</p>
        <div class="confirm-modal-buttons">
            <button class="confirm-btn cancel" onclick="closeConfirmModal(false)">
                <i class="fas fa-times"></i> إلغاء
            </button>
            <button class="confirm-btn confirm" onclick="closeConfirmModal(true)">
                <i class="fas fa-check"></i> نعم، أضف
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // تخزين callback
    window.cartConfirmCallback = callback;
    
    // إضافة تأثير ظهور
    setTimeout(() => overlay.classList.add('active'), 10);
}

// إغلاق نافذة التأكيد
function closeConfirmModal(confirmed) {
    const overlay = document.querySelector('.confirm-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (window.cartConfirmCallback) {
                window.cartConfirmCallback(confirmed);
                window.cartConfirmCallback = null;
            }
        }, 300);
    }
}

// ربط أزرار الإضافة بالسلة
document.addEventListener('DOMContentLoaded', function() {
    // تحديث عداد السلة عند تحميل الصفحة
    updateCartCount();
    
    // إضافة مستمعي الأحداث لأزرار الإضافة
    const addButtons = document.querySelectorAll('.add-btn');
    
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            // البحث عن معلومات المنتج
            const productCard = this.closest('.product-card-modern');
            if (productCard) {
                const productName = productCard.querySelector('h3').textContent;
                const priceText = productCard.querySelector('.price').textContent;
                // استخراج السعر من النص
                const priceMatch = priceText.match(/(\d+)/);
                const productPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
                
                // إضافة للسلة
                addToCart(productName, productPrice);
                
                // تأثير مرئي
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.background = '#28a745';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-plus"></i>';
                    this.style.background = '';
                }, 1500);
            }
        });
    });
});

// إشعار للمستخدم
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// عرض محتويات السلة
function showCart() {
    // التحقق من تسجيل الدخول
    if (!isLoggedIn) {
        showNotification('يرجى تسجيل الدخول أولاً للوصول للسلة');
        showLogin();
        return;
    }
    
    // إنشاء نافذة السلة إذا لم تكن موجودة
    let cartModal = document.getElementById('cartModal');
    
    if (!cartModal) {
        cartModal = document.createElement('div');
        cartModal.id = 'cartModal';
        cartModal.className = 'cart-modal';
        cartModal.innerHTML = '<div class="cart-overlay"></div>' +
            '<div class="cart-content">' +
                '<div class="cart-header">' +
                    '<h2>🛒 سلة التسوق</h2>' +
                    '<button class="close-cart"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<div class="cart-items" id="cartItems"></div>' +
                '<div class="cart-footer">' +
                    '<div class="cart-total">' +
                        '<span>الإجمالي:</span>' +
                        '<span id="cartTotal">0 د.أ</span>' +
                    '</div>' +
                    '<button class="checkout-btn">إتمام الشراء</button>' +
                    '<button class="clear-cart-btn" onclick="clearCart()">إفراغ السلة</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(cartModal);
        
        // إضافة أحداث الإغلاق
        cartModal.querySelector('.close-cart').addEventListener('click', closeCart);
        cartModal.querySelector('.cart-overlay').addEventListener('click', closeCart);
        
        // إضافة حدث إتمام الشراء
        cartModal.querySelector('.checkout-btn').addEventListener('click', showCheckoutForm);
    }
    
    // تحديث محتويات السلة
    updateCartDisplay();
    
    // إظهار النافذة
    setTimeout(function() {
        cartModal.classList.add('active');
    }, 10);
}

// إغلاق السلة
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.remove('active');
        setTimeout(() => cartModal.remove(), 300);
    }
}

// إظهار نموذج إتمام الشراء
function showCheckoutForm() {
    const cartTotal = document.getElementById('cartTotal').textContent;
    
    // إغلاق السلة أولاً
    closeCart();
    
    // إنشاء نافذة إتمام الشراء
    const checkoutModal = document.createElement('div');
    checkoutModal.id = 'checkoutModal';
    checkoutModal.className = 'cart-modal';
    checkoutModal.innerHTML = `
        <div class="cart-overlay"></div>
        <div class="cart-content checkout-content">
            <div class="cart-header">
                <h2>📦 إتمام عملية الشراء</h2>
                <button class="close-cart" onclick="closeCheckout()"><i class="fas fa-times"></i></button>
            </div>
            <form id="checkoutForm" onsubmit="submitOrder(event)">
                <div class="checkout-form">
                    <div class="form-group">
                        <label>الاسم الكامل</label>
                        <input type="text" id="checkoutName" required placeholder="أدخل اسمك الكامل">
                    </div>
                    <div class="form-group">
                        <label>رقم الهاتف</label>
                        <input type="tel" id="checkoutPhone" required placeholder="أدخل رقم هاتفك">
                    </div>
                    <div class="form-group">
                        <label>العنوان</label>
                        <textarea id="checkoutAddress" required placeholder="أدخل عنوانك الكامل" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>ملاحظات إضافية (اختياري)</label>
                        <textarea id="checkoutNotes" placeholder="أي ملاحظات خاصة" rows="2"></textarea>
                    </div>
                    <div class="checkout-summary">
                        <div class="summary-row">
                            <span>المجموع:</span>
                            <span class="total-amount">${cartTotal}</span>
                        </div>
                        <div class="payment-note">
                            <i class="fas fa-info-circle"></i>
                            <span>الدفع عند الاستلام فقط</span>
                        </div>
                    </div>
                    <button type="submit" class="checkout-submit-btn">
                        <i class="fas fa-check-circle"></i>
                        تأكيد الطلب
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(checkoutModal);
    
    // إضافة أحداث الإغلاق
    checkoutModal.querySelector('.close-cart').addEventListener('click', closeCheckout);
    checkoutModal.querySelector('.cart-overlay').addEventListener('click', closeCheckout);
    
    // إظهار النافذة
    setTimeout(function() {
        checkoutModal.classList.add('active');
    }, 10);
}

// إغلاق نافذة إتمام الشراء
function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
        setTimeout(() => checkoutModal.remove(), 300);
    }
}

// إرسال الطلب
function submitOrder(event) {
    event.preventDefault();
    
    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    const address = document.getElementById('checkoutAddress').value;
    const notes = document.getElementById('checkoutNotes').value;
    
    // التحقق من أن السلة ليست فارغة
    const cartItems = JSON.parse(localStorage.getItem('dogHotelCart') || '[]');
    if (cartItems.length === 0) {
        showCheckoutMessage('error', 'السلة فارغة', 'يرجى إضافة منتجات إلى السلة قبل إتمام الشراء');
        return;
    }
    
    // التحقق من رقم الهاتف (10 أرقام)
    if (phone.replace(/\s/g, '').length !== 10) {
        showCheckoutMessage('error', 'رقم الهاتف غير صحيح', 'يجب أن يكون رقم الهاتف 10 أرقام');
        return;
    }
    
    // التحقق من العنوان - يجب أن يحتوي على موقع معروف
    const validLocations = ['هونغ كونغ', 'hong kong', 'الاردن', 'jordan', 'السعودية', 'saudi', 'الامارات', 'uae', 'emirates', 'قطر', 'qatar', 'الكويت', 'kuwait', 'البحرين', 'bahrain', 'العراق', 'iraq', 'مصر', 'egypt', 'لبنان', 'lebanon', 'تركيا', 'turkey', 'الصين', 'china'];
    const addressLower = address.toLowerCase();
    const isValidLocation = validLocations.some(loc => addressLower.includes(loc));
    
    if (!isValidLocation) {
        showCheckoutMessage('error', 'الموقع غير متوفر', 'عذراً،نحن لا نوفر الشحن إلى هذا الموقع حالياً. يرجى إدخال عنوان في إحدى الدول المتاحة');
        return;
    }
    
    // إظهار رسالة نجاح أولاً
    showCheckoutMessage('success', '✓ تم تأكيد طلبك بنجاح!', 'شكراً لك ' + name + '! سنقوم بتجهيز طلبك وإرساله في أقرب وقت ممكن. سنرسل لك رسالة تأكيد عبر الواتساب.');
    
    // إغلاق نافذة الطلب فقط (without clearing cart)
    setTimeout(() => {
        closeCheckout();
    }, 1000);
}

// إظهار رسالة النجاح أو الخطأ
function showCheckoutMessage(type, title, message) {
    const messageModal = document.createElement('div');
    messageModal.id = 'messageModal';
    messageModal.className = 'cart-modal';
    
    const icon = type === 'success' ? '✓' : '✕';
    const iconClass = type === 'success' ? 'success' : 'error';
    
    messageModal.innerHTML = `
        <div class="cart-overlay" onclick="closeMessage()"></div>
        <div class="cart-content message-content">
            <div class="message-icon ${iconClass}">${icon}</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="message-btn" onclick="closeMessage()">حسناً</button>
        </div>
    `;
    document.body.appendChild(messageModal);
    
    setTimeout(function() {
        messageModal.classList.add('active');
    }, 10);
}

// إغلاق رسالة النتيجة
function closeMessage() {
    const messageModal = document.getElementById('messageModal');
    if (messageModal) {
        messageModal.classList.remove('active');
        setTimeout(() => messageModal.remove(), 300);
    }
}

// عرض نافذة تسجيل الدخول
function showLogin() {
    let loginModal = document.getElementById('loginModal');
    
    if (!loginModal) {
        loginModal = document.createElement('div');
        loginModal.id = 'loginModal';
        loginModal.className = 'cart-modal';
        loginModal.innerHTML = '<div class="cart-overlay"></div>' +
            '<div class="cart-content">' +
                '<div class="cart-header">' +
                    '<h2>👤 تسجيل الدخول</h2>' +
                    '<button class="close-cart"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<div class="cart-items" style="padding: 20px;">' +
                    '<form id="loginForm" onsubmit="handleLogin(event)">' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">البريد الإلكتروني</label>' +
                            '<input type="email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أدخل بريدك الإلكتروني">' +
                        '</div>' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">كلمة المرور</label>' +
                            '<input type="password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أدخل كلمة المرور">' +
                        '</div>' +
                        '<button type="submit" class="checkout-btn" style="width: 100%; margin-bottom: 10px;">تسجيل الدخول</button>' +
                        '<button type="button" class="clear-cart-btn" style="width: 100%;" onclick="showRegister()">إنشاء حساب جديد</button>' +
                    '</form>' +
                '</div>' +
            '</div>';
        document.body.appendChild(loginModal);
        
        // إضافة أحداث الإغلاق
        loginModal.querySelector('.close-cart').addEventListener('click', closeLogin);
        loginModal.querySelector('.cart-overlay').addEventListener('click', closeLogin);
    }
    
    setTimeout(function() {
        loginModal.classList.add('active');
    }, 10);
}

// إغلاق نافذة تسجيل الدخول
function closeLogin() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('active');
    }
}

// عرض نافذة التسجيل
function showRegister() {
    closeLogin();
    let registerModal = document.getElementById('registerModal');
    
    if (!registerModal) {
        registerModal = document.createElement('div');
        registerModal.id = 'registerModal';
        registerModal.className = 'cart-modal';
        registerModal.innerHTML = '<div class="cart-overlay"></div>' +
            '<div class="cart-content">' +
                '<div class="cart-header">' +
                    '<h2>📝 إنشاء حساب جديد</h2>' +
                    '<button class="close-cart"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<div class="cart-items" style="padding: 20px;">' +
                    '<form id="registerForm" onsubmit="handleRegister(event)">' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">الاسم الكامل</label>' +
                            '<input type="text" name="fullName" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أدخل اسمك الكامل">' +
                        '</div>' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">البريد الإلكتروني</label>' +
                            '<input type="email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أدخل بريدك الإلكتروني">' +
                        '</div>' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">كلمة المرور</label>' +
                            '<input type="password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أدخل كلمة المرور">' +
                        '</div>' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">تأكيد كلمة المرور</label>' +
                            '<input type="password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أعد إدخال كلمة المرور">' +
                        '</div>' +
                        '<button type="submit" class="checkout-btn" style="width: 100%;">إنشاء حساب</button>' +
                    '</form>' +
                '</div>' +
            '</div>';
        document.body.appendChild(registerModal);
        
        // إضافة أحداث الإغلاق
        registerModal.querySelector('.close-cart').addEventListener('click', closeRegister);
        registerModal.querySelector('.cart-overlay').addEventListener('click', closeRegister);
    }
    
    setTimeout(function() {
        registerModal.classList.add('active');
    }, 10);
}

// إغلاق نافذة التسجيل
function closeRegister() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.classList.remove('active');
    }
}

// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    
    // التحقق من إدخال البريد الإلكتروني
    if (!emailInput || !emailInput.value.trim()) {
        showNotification('❌ يرجى إدخال البريد الإلكتروني');
        return;
    }
    
    // التحقق من إدخال كلمة المرور
    if (!passwordInput || !passwordInput.value.trim()) {
        showNotification('❌ يرجى إدخال كلمة المرور');
        return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', emailInput ? emailInput.value : '');
    // استخراج الاسم من الإيميل
    const email = emailInput ? emailInput.value : '';
    const name = email.split('@')[0];
    localStorage.setItem('userName', name);
    
    isLoggedIn = true;
    updateUserStatus();
    showNotification('تم تسجيل الدخول بنجاح! ✓');
    closeLogin();
    
    // التحقق من وجود بيانات حجز معلقة
    if (pendingBookingData) {
        setTimeout(() => {
            restoreBookingData();
            // إكمال إرسال الطلب بعد استعادة البيانات
            setTimeout(() => {
                completeBookingSubmission();
            }, 500);
        }, 300);
    }
}

// معالجة تسجيل الخروج
function handleLogout() {
    localStorage.setItem('isLoggedIn', 'false');
    isLoggedIn = false;
    updateUserStatus();
    showNotification('تم تسجيل الخروج بنجاح!');
    
    // مسح البيانات المدخلة في نماذج تسجيل الدخول والتسجيل
    clearLoginForms();
}

// مسح البيانات المدخلة في نماذج تسجيل الدخول والتسجيل
function clearLoginForms() {
    // مسح نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }
    
    // مسح نموذج التسجيل
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.reset();
    }
}

// إنشاء نافذة تأكيد تسجيل الخروج
function showLogoutConfirm() {
    let logoutModal = document.getElementById('logoutModal');
    
    if (!logoutModal) {
        logoutModal = document.createElement('div');
        logoutModal.id = 'logoutModal';
        logoutModal.className = 'cart-modal';
        logoutModal.innerHTML = '<div class="cart-overlay"></div>' +
            '<div class="cart-content" style="max-width: 400px; text-align: center;">' +
                '<div class="cart-header" style="justify-content: center;">' +
                    '<h2> تسجيل الخروج</h2>' +
                    '<button class="close-cart" onclick="closeLogoutModal()"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<div class="cart-items" style="padding: 30px;">' +
                    '<i class="fas fa-sign-out-alt" style="font-size: 3rem; color: #e85d04; margin-bottom: 20px;"></i>' +
                    '<p style="font-size: 1.2rem; margin-bottom: 25px; color: #333;">هل أنت متأكد من تسجيل الخروج؟</p>' +
                    '<div style="display: flex; gap: 10px; justify-content: center;">' +
                        '<button class="checkout-btn" onclick="handleLogout(); closeLogoutModal();">نعم، تسجيل الخروج</button>' +
                        '<button class="clear-cart-btn" onclick="closeLogoutModal()">إلغاء</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(logoutModal);
        
        logoutModal.querySelector('.cart-overlay').addEventListener('click', closeLogoutModal);
    }
    
    setTimeout(function() {
        logoutModal.classList.add('active');
    }, 10);
}

// إغلاق نافذة تسجيل الخروج
function closeLogoutModal() {
    const logoutModal = document.getElementById('logoutModal');
    if (logoutModal) {
        logoutModal.classList.remove('active');
    }
}

// تحديث زر تسجيل الدخول/الخروج
function showLogin() {
    if (isLoggedIn) {
        showLogoutConfirm();
        return;
    }
    
    let loginModal = document.getElementById('loginModal');
    
    if (!loginModal) {
        loginModal = document.createElement('div');
        loginModal.id = 'loginModal';
        loginModal.className = 'cart-modal';
        loginModal.innerHTML = '<div class="cart-overlay"></div>' +
            '<div class="cart-content">' +
                '<div class="cart-header">' +
                    '<h2>👤 تسجيل الدخول</h2>' +
                    '<button class="close-cart"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<div class="cart-items" style="padding: 20px;">' +
                    '<form id="loginForm" onsubmit="handleLogin(event)">' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">البريد الإلكتروني</label>' +
                            '<input type="email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أدخل بريدك الإلكتروني">' +
                        '</div>' +
                        '<div class="form-group" style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; color: #333;">كلمة المرور</label>' +
                            '<input type="password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="أدخل كلمة المرور">' +
                        '</div>' +
                        '<button type="submit" class="checkout-btn" style="width: 100%; margin-bottom: 10px;">تسجيل الدخول</button>' +
                        '<button type="button" class="clear-cart-btn" style="width: 100%;" onclick="showRegister()">إنشاء حساب جديد</button>' +
                    '</form>' +
                '</div>' +
            '</div>';
        document.body.appendChild(loginModal);
        
        // إضافة أحداث الإغلاق
        loginModal.querySelector('.close-cart').addEventListener('click', closeLogin);
        loginModal.querySelector('.cart-overlay').addEventListener('click', closeLogin);
    }
    
    setTimeout(function() {
        loginModal.classList.add('active');
    }, 10);
}

// معالجة التسجيل
function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const nameInput = form.querySelector('input[name="fullName"]');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelectorAll('input[type="password"]')[0];
    const confirmPasswordInput = form.querySelectorAll('input[type="password"]')[1];
    
    // التحقق من تطابق كلمات المرور
    if (passwordInput && confirmPasswordInput) {
        if (passwordInput.value !== confirmPasswordInput.value) {
            showNotification('❌ كلمات المرور غير متطابقة! يرجى التأكد من كتابتها بشكل متساوي');
            return;
        }
        
        // التحقق من طول كلمة المرور
        if (passwordInput.value.length < 6) {
            showNotification('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
    }
    
    // التحقق من إدخال الاسم
    if (!nameInput || !nameInput.value.trim()) {
        showNotification('❌ يرجى إدخال الاسم الكامل');
        return;
    }
    
    // التحقق من البريد الإلكتروني
    if (!emailInput || !emailInput.value.trim()) {
        showNotification('❌ يرجى إدخال البريد الإلكتروني');
        return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', nameInput ? nameInput.value : 'مستخدم');
    localStorage.setItem('userEmail', emailInput ? emailInput.value : '');
    
    isLoggedIn = true;
    updateUserStatus();
    showNotification('تم إنشاء الحساب بنجاح! 🎉');
    closeRegister();
    
    // التحقق من وجود بيانات حجز معلقة
    if (pendingBookingData) {
        setTimeout(() => {
            restoreBookingData();
            // إكمال إرسال الطلب بعد استعادة البيانات
            setTimeout(() => {
                completeBookingSubmission();
            }, 500);
        }, 300);
    }
}

// تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-basket"></i><p>السلة فارغة</p><span>أضف منتجات لتبدأ التسوق</span></div>';
        cartTotal.textContent = '0 د.أ';
    } else {
        let total = 0;
        let html = '';
        
        cart.forEach(function(item, index) {
            total += item.price * item.quantity;
            html += '<div class="cart-item">' +
                '<div class="cart-item-info">' +
                    '<h4>' + item.name + '</h4>' +
                    '<span class="cart-item-price">' + item.price + ' د.أ</span>' +
                '</div>' +
                '<div class="cart-item-actions">' +
                    '<span class="cart-quantity-badge">' + item.quantity + '</span>' +
                    '<button onclick="removeFromCart(' + index + ')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        });
        
        cartItems.innerHTML = html;
        cartTotal.textContent = total + ' د.أ';
    }
    
    updateCartCount();
}

// حذف منتج من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('dogHotelCart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('تم حذف المنتج من السلة');
}

// إفراغ السلة
function clearCart() {
    cart = [];
    localStorage.setItem('dogHotelCart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('تم إفراغ السلة');
}

// دالة لتبديل لوحة إمكانيات الوصول
function toggleAccessibilityPanel() {
    const panel = document.getElementById('accessibilityPanel');
    panel.classList.toggle('active');
    
    // إضافة overlay إذا لم يكن موجوداً
    let overlay = document.querySelector('.panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'panel-overlay';
        overlay.onclick = toggleAccessibilityPanel;
        document.body.appendChild(overlay);
    }
    
    setTimeout(() => {
        overlay.classList.toggle('active');
    }, 100);
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', function(e) {
    const panel = document.getElementById('accessibilityPanel');
    const btn = document.querySelector('.floating-access-btn');
    if (panel && panel.classList.contains('active') && 
        !panel.contains(e.target) && !btn.contains(e.target)) {
        toggleAccessibilityPanel();
    }
});

// دالة تكبير النص
function increaseFontSize() {
    if (fontSize < 120) {
        fontSize += 20;
        document.documentElement.style.fontSize = fontSize + '%';
        document.body.style.fontSize = fontSize + '%';
        document.getElementById('sizeDisplay').textContent = fontSize + '%';
        // حفظ الإعداد
        localStorage.setItem('fontSize', fontSize);
        updateAccessibilityIndicator();
    }
}

// دالة تصغير النص
function decreaseFontSize() {
    if (fontSize > 80) {
        fontSize -= 20;
        document.documentElement.style.fontSize = fontSize + '%';
        document.body.style.fontSize = fontSize + '%';
        document.getElementById('sizeDisplay').textContent = fontSize + '%';
        // حفظ الإعداد
        localStorage.setItem('fontSize', fontSize);
        updateAccessibilityIndicator();
    }
}


// دالة تبديل الوضع الداكن
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    document.getElementById('darkToggle').checked = isDarkMode;
    // حفظ الإعداد
    localStorage.setItem('darkMode', isDarkMode);
    updateAccessibilityIndicator();
}

// دالة تبديل تباعد النصوص
function toggleTextSpacing() {
    isTextSpacing = !isTextSpacing;
    document.body.classList.toggle('text-spacing');
    document.getElementById('spacingToggle').checked = isTextSpacing;
    // حفظ الإعداد
    localStorage.setItem('textSpacing', isTextSpacing);
    updateAccessibilityIndicator();
}

// دالة تبديل مؤشر الكلب
function toggleCursor() {
    isCursorDog = !isCursorDog;
    document.body.classList.toggle('dog-cursor');
    
    // حفظ الحالة في localStorage
    localStorage.setItem('dogCursor', isCursorDog);
    
    document.getElementById('cursorToggle').checked = isCursorDog;
    updateAccessibilityIndicator();
}

// دالة تبديل قارئ النصوص
function toggleTextReader() {
    isTextReaderActive = !isTextReaderActive;
    document.getElementById('textReaderToggle').checked = isTextReaderActive;
    
    if (isTextReaderActive) {
        startTextReader();
    } else {
        stopTextReader();
    }
    
    // حفظ الإعداد
    localStorage.setItem('textReader', isTextReaderActive);
    updateAccessibilityIndicator();
}

let currentHighlightedElement = null;

function startTextReader() {
    // إيقاف أي قراءة جارية
    speechSynthesis.cancel();
    
    // إزالة أي تمييز سابق
    removeAllHighlights();
    
    // الحصول على جميع النصوص المقروءة
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, label, span:not(.accessibility-check):not(.pulse-ring), a, button');
    let wordQueue = [];
    
    // جمع الكلمات مع عناصرها
    textElements.forEach(element => {
        if (element.closest('.accessibility-panel') || element.closest('.cart-modal') || element.closest('.nav-menu')) {
            return;
        }
        
        const text = element.innerText.trim();
        if (text && text.length > 2) {
            // تقسيم النص إلى كلمات
            const words = text.split(/\s+/);
            words.forEach(word => {
                if (word.trim()) {
                    wordQueue.push({
                        word: word,
                        element: element
                    });
                }
            });
            // إضافة فاصل بين الجمل
            wordQueue.push({ word: '. ', element: element, isPause: true });
        }
    });
    
    if (wordQueue.length === 0) return;
    
    // قراءة الكلمات واحدة تلو الأخرى
    readWordQueue(wordQueue, 0);
}

function readWordQueue(queue, index) {
    if (!isTextReaderActive || index >= queue.length) {
        removeAllHighlights();
        // إيقاف القارئ بعد قراءة كل شيء مرة واحدة
        stopTextReader();
        document.getElementById('textReaderToggle').checked = false;
        return;
    }
    
    const item = queue[index];
    
    // تخطي فواصل الجمل
    if (item.isPause) {
        removeAllHighlights();
        setTimeout(() => readWordQueue(queue, index + 1), 300);
        return;
    }
    
    //تمييز العنصر الحالي
    removeAllHighlights();
    if (item.element) {
        item.element.classList.add('text-reader-highlight');
        currentHighlightedElement = item.element;
    }
    
    // قراءة الكلمة
    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    
    const voices = speechSynthesis.getVoices();
    const arabicVoice = voices.find(voice => voice.lang.includes('ar'));
    if (arabicVoice) {
        utterance.voice = arabicVoice;
    }
    
    utterance.onend = function() {
        readWordQueue(queue, index + 1);
    };
    
    utterance.onerror = function() {
        readWordQueue(queue, index + 1);
    };
    
    speechSynthesis.speak(utterance);
}

function removeAllHighlights() {
    document.querySelectorAll('.text-reader-highlight').forEach(el => {
        el.classList.remove('text-reader-highlight');
    });
}

function stopTextReader() {
    speechSynthesis.cancel();
    removeAllHighlights();
}

// دالة إعادة الضبط
function resetSettings() {
    fontSize = 100;
    isDarkMode = false;
    isTextSpacing = false;
    isCursorDog = false;
    
    document.documentElement.style.fontSize = '100%';
    document.body.style.fontSize = '100%';
    
    // حفظ الإعداد
    localStorage.setItem('fontSize', 100);
    localStorage.setItem('textSpacing', 'false');
    localStorage.setItem('darkMode', 'false');
    document.body.classList.remove('dark-mode', 'text-spacing', 'dog-cursor');
    
    // حفظ الحالة في localStorage
    localStorage.setItem('dogCursor', 'false');
    
    document.getElementById('sizeDisplay').textContent = '100%';
    document.getElementById('darkToggle').checked = false;
    document.getElementById('spacingToggle').checked = false;
    document.getElementById('cursorToggle').checked = false;
    
    updateAccessibilityIndicator();
}

// دالة للتمرير للأعلى
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// إظهار زر التمرير للأعلى عند النزول
window.addEventListener('scroll', function() {
    const scrollBtn = document.querySelector('.scroll-top-btn');
    if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
    }
});

// =====================
// دالة للتعامل مع حدث تحميل الصفحة
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// إظهار زر التمرير للأعلى عند النزول
window.addEventListener('scroll', function() {
    const scrollBtn = document.querySelector('.scroll-top-btn');
    if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
    }
});

// دالة للتعامل مع حدث تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة بنجاح - Loving Homes');
    
    // تفعيل مؤشر الكلب بناءً على localStorage أو افتراضياً
    if (isCursorDog) {
        document.body.classList.add('dog-cursor');
    }
    document.getElementById('cursorToggle').checked = isCursorDog;
});

// أزرار إضافة للسلة
const addButtons = document.querySelectorAll('.add-btn, .bundle-btn');
addButtons.forEach(button => {
    button.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i>';
        this.style.background = '#28a745';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = '';
        }, 1500);
    });
});

// تأثيرات البطاقات
const cards = document.querySelectorAll('.product-card-modern, .feature-box, .cat-card, .testimonial-card-modern');
cards.forEach(card => {
    card.style.transition = 'transform 0.3s ease';
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// =====================
// الأسئلة الشائعة - FAQ Accordion
// =====================
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // إغلاق الأسئلة
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // تبديل حالة السؤال الحالي
            item.classList.toggle('active');
        });
    });
    
    // =====================
    // سياسة الخصوصية - Privacy Accordion
    // =====================
    const privacyItems = document.querySelectorAll('.privacy-item');
    
    privacyItems.forEach(item => {
        const question = item.querySelector('.privacy-question');
        
        question.addEventListener('click', function() {
            // إغلاق الأسئلة
            privacyItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // تبديل حالة السؤال الحالي
            item.classList.toggle('active');
        });
    });
});

// =====================
// شريط التنقل الفرعي - Sub Navigation
// =====================
document.addEventListener('DOMContentLoaded', function() {
    const subNavItems = document.querySelectorAll('.sub-nav-item');
    const products = document.querySelectorAll('.product-card-modern');
    
    if (subNavItems.length > 0) {
        subNavItems.forEach(item => {
            item.addEventListener('click', function() {
                // إزالة الـ active من جميع العناصر
                subNavItems.forEach(i => i.classList.remove('active'));
                // إضافة الـ active للعنصر المحدد
                this.classList.add('active');
                
                const category = this.dataset.category;
                
                // تصفية المنتجات
                products.forEach(product => {
                    if (category === 'all' || product.dataset.category === category) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        });
    }
});

// =====================
// فلتر السعر - Price Filter
// =====================
function updatePriceDisplay() {
    document.getElementById('priceValue').textContent = document.getElementById('priceRange').value;
}

function filterByPrice() {
    const maxPrice = parseInt(document.getElementById('priceRange').value);
    const products = document.querySelectorAll('.product-card-modern');
    
    products.forEach(product => {
        // استخراج السعر من العنصر
        const priceText = product.querySelector('.price').textContent;
        // استخراج الرقم من النص
        const priceMatch = priceText.match(/\d+/);
        
        if (!priceMatch) {
            product.style.display = 'none';
            return;
        }
        
        const price = parseInt(priceMatch[0]);
        
        // إظهار المنتجات التي سعرها أقل من أو يساوي السعر المحدد
        product.style.display = price <= maxPrice ? 'block' : 'none';
    });
}

// =====================
// إضافة تقييم - Add Review
// =====================
function toggleReviewForm() {
    // التحقق من تسجيل الدخول
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        // إظهار نافذة تسجيل الدخول مطلوب
        showLoginRequiredModal();
        return;
    }
    
    // تحميل معلومات المستخدم
    loadUserInfoForReview();
    
    const form = document.getElementById('reviewForm');
    form.classList.toggle('active');
}

// =====================
// Show Login Required Modal
// =====================
function showLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function showLoginFromTestimonial() {
    closeLoginRequiredModal();
    showLogin();
}

function showRegisterFromTestimonial() {
    closeLoginRequiredModal();
    showRegister();
}

// =====================
// Load User Info for Review
// =====================
function loadUserInfoForReview() {
    const userName = localStorage.getItem('userName') || 'ضيف';
    const userEmail = localStorage.getItem('userEmail') || 'ضيف@موقع.كوم';
    const hasBooking = localStorage.getItem('hasActiveBooking') === 'true';
    const dogName = localStorage.getItem('dogName') || '';
    
    const displayName = document.getElementById('displayUserName');
    const displayEmail = document.getElementById('displayUserEmail');
    const dogInput = document.getElementById('dogNameInput');
    
    if (displayName) displayName.textContent = userName;
    if (displayEmail) displayEmail.textContent = userEmail;
    if (dogInput) {
        if (hasBooking && dogName) {
            dogInput.placeholder = 'اسم كلبك: ' + dogName;
            dogInput.value = dogName;
        } else {
            dogInput.placeholder = 'اسم كلبك (اختياري)';
            dogInput.value = '';
        }
    }
}

// =====================
// Booking Modal - bundles page
// =====================
function openBookingModal(packageName) {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        // Set the selected package if provided
        if (packageName) {
            const select = document.getElementById('selectedPackage');
            if (select) {
                select.value = packageName;
            }
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// متغير لحفظ بيانات النموذج مؤقتاً قبل تسجيل الدخول
let pendingBookingData = null;

function submitBooking(event) {
    event.preventDefault();
    
    const form = document.getElementById('bookingForm');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    // Validate all required fields
    inputs.forEach(input => {
        validateField(input);
        if (input.classList.contains('invalid') || (!input.value && input.hasAttribute('required'))) {
            isValid = false;
            input.classList.add('error');
        }
    });
    
    // Check if form is valid
    if (!isValid) {
        // Shake the form to indicate error
        form.style.animation = 'none';
        form.offsetHeight; /* trigger reflow */
        form.style.animation = 'shakeForm 0.5s ease';
        return;
    }
    
    // التحقق من تسجيل الدخول
    if (!isLoggedIn) {
        // حفظ بيانات النموذج مؤقتاً
        pendingBookingData = {
            dogName: document.getElementById('dogName').value,
            dogType: document.getElementById('dogType').value,
            dogAge: document.getElementById('dogAge').value,
            arrivalDate: document.getElementById('arrivalDate').value,
            departureDate: document.getElementById('departureDate').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            selectedPackage: document.getElementById('selectedPackage').value,
            notes: document.querySelector('#bookingForm textarea').value
        };
        
        // إغلاق نافذة الحجز
        closeBookingModal();
        
        // عرض نافذة تسجيل الدخول المطلوبة
        showLoginRequiredForBooking();
        return;
    }
    
    // إذا كان مسجل الدخول، إرسال الطلب مباشرة
    completeBookingSubmission();
}

// عرض نافذة تسجيل الدخول المطلوبة للحجز
function showLoginRequiredForBooking() {
    let modal = document.getElementById('loginRequiredBookingModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loginRequiredBookingModal';
        modal.className = 'cart-modal';
        modal.innerHTML = `
            <div class="cart-overlay" onclick="closeLoginRequiredBookingModal()"></div>
            <div class="cart-content" style="max-width: 450px; text-align: center;">
                <div class="cart-header" style="justify-content: center;">
                    <h2>تسجيل الدخول مطلوب</h2>
                    <button class="close-cart" onclick="closeLoginRequiredBookingModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="cart-items" style="padding: 30px;">
                    <i class="fas fa-user-lock" style="font-size: 4rem; color: #e85d04; margin-bottom: 20px;"></i>
                    <p style="font-size: 1.1rem; margin-bottom: 10px; color: #333;">يجب تسجيل الدخول أولاً لإتمام حجزك</p>
                    <p style="font-size: 0.9rem; margin-bottom: 25px; color: #666;">قم بتسجيل الدخول أو إنشاء حساب جديد لإكمال طلب الحجز</p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="checkout-btn" onclick="showLoginFromBooking()" style="min-width: 150px;">
                            <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
                        </button>
                        <button class="clear-cart-btn" onclick="showRegisterFromBooking()" style="min-width: 150px;">
                            <i class="fas fa-user-plus"></i> إنشاء حساب
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    setTimeout(function() {
        modal.classList.add('active');
    }, 10);
}

// إغلاق نافذة تسجيل الدخول المطلوبة للحجز
function closeLoginRequiredBookingModal() {
    const modal = document.getElementById('loginRequiredBookingModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// فتح نافذة تسجيل الدخول من نافذة الحجز
function showLoginFromBooking() {
    closeLoginRequiredBookingModal();
    showLogin();
}

// فتح نافذة التسجيل من نافذة الحجز
function showRegisterFromBooking() {
    closeLoginRequiredBookingModal();
    showRegister();
}

// إكمال إرسال طلب الحجز بعد تسجيل الدخول
function completeBookingSubmission() {
    const form = document.getElementById('bookingForm');
    const inputs = form.querySelectorAll('input[required]');
    
    // مسح بيانات النموذج بعد الإرسال الناجح
    form.reset();
    
    // إزالة كلاسات التحقق من جميع الحقول
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid', 'error');
    });
    
    // Reset char count
    const phoneCount = document.getElementById('phoneCount');
    if (phoneCount) {
        phoneCount.textContent = '0/10';
        phoneCount.classList.remove('warning', 'valid', 'error');
    }
    
    // Close booking modal
    closeBookingModal();
    
    // Show thank you modal
    const thankYouModal = document.getElementById('thankYouModal');
    if (thankYouModal) {
        thankYouModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // مسح البيانات المؤقتة
    pendingBookingData = null;
}

// استعادة بيانات النموذج بعد تسجيل الدخول
function restoreBookingData() {
    if (pendingBookingData) {
        document.getElementById('dogName').value = pendingBookingData.dogName;
        document.getElementById('dogType').value = pendingBookingData.dogType;
        document.getElementById('dogAge').value = pendingBookingData.dogAge;
        document.getElementById('arrivalDate').value = pendingBookingData.arrivalDate;
        document.getElementById('departureDate').value = pendingBookingData.departureDate;
        document.getElementById('phoneNumber').value = pendingBookingData.phoneNumber;
        document.getElementById('selectedPackage').value = pendingBookingData.selectedPackage;
        document.querySelector('#bookingForm textarea').value = pendingBookingData.notes;
        
        // التحقق من الحقول
        const inputs = document.querySelectorAll('#bookingForm input[required]');
        inputs.forEach(input => validateField(input));
        
        // فتح نافذة الحجز
        openBookingModal();
    }
}

function closeThankYouModal() {
    const thankYouModal = document.getElementById('thankYouModal');
    if (thankYouModal) {
        thankYouModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Form Validation Functions
function validateField(input) {
    const value = input.value.trim();
    const fieldId = input.id;
    
    // Remove previous validation classes
    input.classList.remove('valid', 'invalid', 'error');
    
    // Phone number validation
    if (fieldId === 'phoneNumber') {
        const charCount = document.getElementById('phoneCount');
        charCount.textContent = value.length + '/10';
        
        if (value.length > 0) {
            charCount.classList.remove('warning', 'valid', 'error');
            if (value.length < 10) {
                charCount.classList.add('warning');
                input.classList.add('pending'); // إضافة كلاس للحالة المعلقة
                input.classList.remove('valid', 'invalid', 'error');
            } else if (value.length === 10) {
                // Check if it starts with 07
                if (value.startsWith('07')) {
                    charCount.classList.add('valid');
                    input.classList.add('valid');
                    input.classList.remove('invalid', 'error', 'pending');
                } else {
                    charCount.classList.add('error');
                    input.classList.add('invalid');
                    input.classList.remove('valid', 'error', 'pending');
                }
            } else {
                charCount.classList.add('error');
                input.classList.add('invalid');
                input.classList.remove('valid', 'error', 'pending');
            }
        } else {
            // عندما يكون الحقل فارغاً
            charCount.classList.remove('warning', 'valid', 'error');
            input.classList.remove('valid', 'invalid', 'error', 'pending');
        }
        return;
    }
    
    // Dog name validation - letters only
    if (fieldId === 'dogName') {
        const namePattern = /^[\u0600-\u06FFa-zA-Z\s]{2,}$/;
        if (value.length > 0 && namePattern.test(value)) {
            input.classList.add('valid');
            input.classList.remove('invalid', 'error');
        } else if (value.length > 0) {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
        return;
    }
    
    // Dog type validation - letters only
    if (fieldId === 'dogType') {
        const typePattern = /^[\u0600-\u06FFa-zA-Z\s]{2,}$/;
        if (value.length > 0 && typePattern.test(value)) {
            input.classList.add('valid');
            input.classList.remove('invalid', 'error');
        } else if (value.length > 0) {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
        return;
    }
    
    // Dog age validation - numbers only
    if (fieldId === 'dogAge') {
        const agePattern = /^[0-9]{1,2}$/;
        if (value.length > 0 && agePattern.test(value) && parseInt(value) > 0 && parseInt(value) <= 30) {
            input.classList.add('valid');
            input.classList.remove('invalid', 'error');
        } else if (value.length > 0) {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
        return;
    }
    
    // Date validation
    if (fieldId === 'arrivalDate' || fieldId === 'departureDate') {
        if (value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(value);
            
            if (fieldId === 'arrivalDate') {
                if (inputDate >= today) {
                    input.classList.add('valid');
                    input.classList.remove('invalid', 'error');
                } else {
                    input.classList.add('invalid');
                    input.classList.remove('valid');
                }
            } else if (fieldId === 'departureDate') {
                const arrivalDate = document.getElementById('arrivalDate');
                if (arrivalDate && arrivalDate.value) {
                    const arrival = new Date(arrivalDate.value);
                    if (inputDate > arrival) {
                        input.classList.add('valid');
                        input.classList.remove('invalid', 'error');
                    } else {
                        input.classList.add('invalid');
                        input.classList.remove('valid');
                    }
                } else if (inputDate >= today) {
                    input.classList.add('valid');
                    input.classList.remove('invalid', 'error');
                } else {
                    input.classList.add('invalid');
                    input.classList.remove('valid');
                }
            }
        }
        return;
    }
}

// Additional input filtering for numeric fields
document.addEventListener('DOMContentLoaded', function() {
    // Filter phone input to numbers only
    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    // Filter age input to numbers only
    const ageInput = document.getElementById('dogAge');
    if (ageInput) {
        ageInput.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    // Filter name input to letters only
    const nameInput = document.getElementById('dogName');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (!/[\u0600-\u06FFa-zA-Z\s]/.test(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    // Filter dog type input to letters only
    const typeInput = document.getElementById('dogType');
    if (typeInput) {
        typeInput.addEventListener('keypress', function(e) {
            if (!/[\u0600-\u06FFa-zA-Z\s]/.test(e.key)) {
                e.preventDefault();
            }
        });
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const bookingModal = document.getElementById('bookingModal');
    if (bookingModal && bookingModal.classList.contains('active')) {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    }
    
    const thankYouModal = document.getElementById('thankYouModal');
    if (thankYouModal && thankYouModal.classList.contains('active')) {
        if (e.target === thankYouModal) {
            closeThankYouModal();
        }
    }
});

// Rating stars functionality
document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.rating-stars i');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            
            // Remove active class from all stars
            stars.forEach(s => s.classList.remove('active'));
            
            // Add active class to selected stars
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('active');
            }
        });
    });
});

function submitReview(event) {
    if (event) event.preventDefault();
    
    // التحقق من تسجيل الدخول
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // منع التقييم إذا لم يكن المستخدم مسجلاً دخوله
    if (!isLoggedIn) {
        showLoginRequiredModal();
        return;
    }
    
    const textarea = document.querySelector('.add-review-form textarea');
    const reviewText = textarea.value.trim();
    const activeStars = document.querySelectorAll('.rating-stars i.active');
    const dogInput = document.getElementById('dogNameInput');
    const dogName = dogInput ? dogInput.value.trim() : '';
    
    if (reviewText === '') {
        alert('الرجاء كتابة تجربتك أولاً');
        return;
    }
    
    if (activeStars.length === 0) {
        alert('الرجاء اختيار التقييم');
        return;
    }
    
    // Get user info
    const userName = localStorage.getItem('userName') || 'ضيف';
    const userEmail = localStorage.getItem('userEmail') || 'ضيف@موقع.كوم';
    
    // Create rating stars
    const rating = activeStars.length;
    const stars = '⭐'.repeat(rating);
    
    // Get the testimonials grid
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    

    // Create dog info text
    const dogInfoText = dogName ? ' كلبه: ' + dogName : '';
    
    // Create unique ID for the testimonial (defined outside the if block)
    const testimonialId = 'testimonial_' + Date.now();
    
    if (testimonialsGrid) {
        // Create new testimonial element
        const newTestimonial = document.createElement('div');
        newTestimonial.className = 'testimonial-card-modern new-review';
        newTestimonial.id = testimonialId;
        newTestimonial.innerHTML = `
            <div class="testimonial-header">
                <div class="avatar user-avatar"></div>
                <div class="info">
                    <h4>${userName}</h4>
                    <p>التقييم الآن</p>
                </div>
                <div class="stars">${stars}</div>
                <button class="delete-review-btn" onclick="deleteReview('${testimonialId}')" title="حذف التعليق">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <p class="quote">"${reviewText}"</p>
            <div class="dog-info">${dogInfoText}</div>
        `;
        
        // Add new testimonial at the beginning
        testimonialsGrid.insertBefore(newTestimonial, testimonialsGrid.firstChild);
    }
    
    // Save to localStorage for persistence
    saveTestimonial({
        id: testimonialId,
        name: userName,
        email: userEmail,
        rating: rating,
        text: reviewText,
        dogName: dogName,
        date: new Date().toLocaleDateString('ar')
    });
    
    // Clear form
    textarea.value = '';
    activeStars.forEach(s => s.classList.remove('active'));
    if (dogInput) dogInput.value = '';
    
    // Close review form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.classList.remove('active');
        reviewForm.style.display = 'none';
    }
    
    // Show thank you modal
    setTimeout(function() {
        const thankYouModal = document.getElementById('thankYouModal');
        if (thankYouModal) {
            thankYouModal.classList.add('active');
        }
    }, 300);
}

// =====================
// Save Testimonial to LocalStorage
// =====================
function saveTestimonial(testimonial) {
    let testimonials = JSON.parse(localStorage.getItem('userTestimonials')) || [];
    testimonials.unshift(testimonial); // Add to beginning
    localStorage.setItem('userTestimonials', JSON.stringify(testimonials));
}

// =====================
// Delete Review Function
// =====================
function deleteReview(testimonialId) {
    // التحقق من تسجيل الدخول
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        showLoginRequiredModal();
        return;
    }
    
    // إظهار نافذة تأكيد الحذف المخصصة
    showDeleteConfirmModal(testimonialId);
}

// =====================
// نافذة تأكيد الحذف المخصصة
// =====================
function showDeleteConfirmModal(testimonialId) {
    // إغلاق أي نافذة تأكيد حذف موجودة
    const existingModal = document.getElementById('deleteConfirmModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'deleteConfirmModal';
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-overlay" style="background: rgba(0,0,0,0.6);"></div>
        <div class="cart-content" style="max-width: 400px; border-radius: 20px;">
            <div class="cart-header" style="justify-content: center; border-bottom: 1px solid #eee; padding: 20px;">
                <h2 style="color: #e85d04; margin: 0;"> تأكيد الحذف</h2>
            </div>
            <div style="padding: 30px 20px; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 15px;">⚠️</div>
                <p style="font-size: 1.1rem; color: #333; margin-bottom: 25px; line-height: 1.6;">
                    هل أنت متأكد من حذف هذا التعليق؟<br>
                    <span style="color: #666; font-size: 0.95rem;">لا يمكن التراجع عن هذا الإجراء</span>
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="confirmDeleteReview('${testimonialId}')" style="
                        background: #e85d04;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 10px;
                        font-size: 1rem;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-trash-alt"></i> نعم، حذف
                    </button>
                    <button onclick="closeDeleteConfirmModal()" style="
                        background: #f5f5f5;
                        color: #333;
                        border: 1px solid #ddd;
                        padding: 12px 30px;
                        border-radius: 10px;
                        font-size: 1rem;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة أحداث الإغلاق
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    modal.querySelector('.cart-overlay').addEventListener('click', closeDeleteConfirmModal);
}

// =====================
// إغلاق نافذة تأكيد الحذف
// =====================
function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// =====================
// تأكيد حذف التعليق
// =====================
function confirmDeleteReview(testimonialId) {
    // إغلاق النافذة
    closeDeleteConfirmModal();
    
    // حذف من DOM
    const testimonialElement = document.getElementById(testimonialId);
    if (testimonialElement) {
        testimonialElement.remove();
    }
    
    // حذف من localStorage
    let testimonials = JSON.parse(localStorage.getItem('userTestimonials')) || [];
    testimonials = testimonials.filter(t => t.id !== testimonialId);
    localStorage.setItem('userTestimonials', JSON.stringify(testimonials));
    
    // إشعار المستخدم
    showNotification('تم حذف التعليق بنجاح ✓');
}

// =====================
// Load Saved Testimonials
// =====================
function loadSavedTestimonials() {
    const testimonials = JSON.parse(localStorage.getItem('userTestimonials')) || [];
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    
    if (!testimonialsGrid || testimonials.length === 0) return;
    
    // تحديث التعليقات لإضافة معرف إذا لم يكن موجوداً
    let updated = false;
    testimonials.forEach((testimonial, index) => {
        if (!testimonial.id) {
            testimonial.id = 'testimonial_' + (Date.now() + index);
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('userTestimonials', JSON.stringify(testimonials));
    }
    
    testimonials.forEach(testimonial => {
        // Check if this testimonial already exists
        const existingCards = testimonialsGrid.querySelectorAll('.testimonial-card-modern');
        let exists = false;
        existingCards.forEach(card => {
            const quote = card.querySelector('.quote');
            if (quote && quote.textContent.includes(testimonial.text)) {
                exists = true;
            }
        });
        
        if (!exists) {
            const stars = '⭐'.repeat(testimonial.rating);
            const dogInfoText = testimonial.dogName ? ' كلبه: ' + testimonial.dogName : '';
            
            const newTestimonial = document.createElement('div');
            newTestimonial.className = 'testimonial-card-modern new-review';
            newTestimonial.id = testimonial.id;
            newTestimonial.innerHTML = `
                <div class="testimonial-header">
                    <div class="avatar user-avatar"></div>
                    <div class="info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.date || 'التقييم الآن'}</p>
                    </div>
                    <div class="stars">${stars}</div>
                    <button class="delete-review-btn" onclick="deleteReview('${testimonial.id}')" title="حذف التعليق">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <p class="quote">"${testimonial.text}"</p>
                <div class="dog-info">${dogInfoText}</div>
            `;
            
            testimonialsGrid.insertBefore(newTestimonial, testimonialsGrid.firstChild);
        }
    });
}

// Load testimonials when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTestimonials();
});

function closeThankYouModal() {
    const thankYouModal = document.getElementById('thankYouModal');
    if (thankYouModal) {
        thankYouModal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('thankYouModal');
    if (modal && modal.classList.contains('active')) {
        if (e.target === modal) {
            closeThankYouModal();
        }
    }
});
