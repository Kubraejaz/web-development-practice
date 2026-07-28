/**
 * Nimbus Store & Gear Studio - Core App Interactivity
 * Feature Set: Product Catalog, Multi-Filter, Quick View Modal, Cart Drawer & LocalStorage
 */

(function () {
    'use strict';

    const CART_STORAGE_KEY = 'nimbus_store_cart_v1';
    const THEME_KEY = 'nimbus_store_theme';

    // Seeded Product Catalog
    const products = [
        {
            id: 'prod-1',
            title: 'Nimbus Pro Dock 12-in-1',
            category: 'Hardware',
            price: 189,
            rating: 4.9,
            badge: 'best',
            badgeText: 'Top Seller',
            icon: '⚡',
            desc: 'Dual 4K 120Hz display output, 100W Power Delivery, SD 4.0 card reader & Gigabit Ethernet.'
        },
        {
            id: 'prod-2',
            title: 'Mechanical Keychron Q1 Pro',
            category: 'Hardware',
            price: 199,
            rating: 4.8,
            badge: 'hot',
            badgeText: 'Popular',
            icon: '⌨️',
            desc: 'QMK/VIA wireless mechanical keyboard with double-gasket design & hot-swappable switches.'
        },
        {
            id: 'prod-3',
            title: 'Ergonomic Memory Foam Wrist Rest',
            category: 'Accessories',
            price: 29,
            rating: 4.6,
            badge: 'new',
            badgeText: 'New',
            icon: '🛋️',
            desc: 'Contoured cooling gel memory foam pad for long coding sessions and wrist support.'
        },
        {
            id: 'prod-4',
            title: 'Ultra-Wide Desk Mat (900x400mm)',
            category: 'Accessories',
            price: 35,
            rating: 4.7,
            badge: 'hot',
            badgeText: 'Hot',
            icon: '🖥️',
            desc: 'Stitch-edged hydrophobic micro-weave cloth mat with rubber non-slip base.'
        },
        {
            id: 'prod-5',
            title: 'Active Noise Canceling Studio Headphones',
            category: 'Audio',
            price: 249,
            rating: 4.9,
            badge: 'best',
            badgeText: 'Top Pick',
            icon: '🎧',
            desc: 'High-res audio driver, 40-hour battery life & custom acoustic tuning for maximum focus.'
        },
        {
            id: 'prod-6',
            title: 'Podcast Cardioid USB Microphone',
            category: 'Audio',
            price: 119,
            rating: 4.7,
            badge: null,
            badgeText: '',
            icon: '🎙️',
            desc: 'Studio-grade 24-bit/96kHz condenser mic with built-in pop filter and mute touch sensor.'
        },
        {
            id: 'prod-7',
            title: 'Official Nimbus Dev Hoodie (Dark Slate)',
            category: 'Apparel',
            price: 65,
            rating: 4.8,
            badge: 'new',
            badgeText: 'Exclusive',
            icon: '🧥',
            desc: 'Heavyweight 450gsm organic cotton hoodie featuring embroidered Nimbus developer insignia.'
        },
        {
            id: 'prod-8',
            title: 'Minimalist Stainless Steel Insulated Mug',
            category: 'Apparel',
            price: 24,
            rating: 4.5,
            badge: null,
            badgeText: '',
            icon: '☕',
            desc: 'Double-wall vacuum insulation keeps coffee hot for 6 hours. Leak-proof lid.'
        }
    ];

    // State Variables
    let cart = [];
    let activeCategory = 'all';
    let searchQuery = '';
    let maxPrice = 300;
    let minRating = 0;
    let sortMode = 'featured';
    let promoDiscount = 0; // 0.1 for 10%

    // DOM Element Cache
    const productGrid = document.getElementById('productGrid');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const productCount = document.getElementById('productCount');
    const sortSelect = document.getElementById('sortSelect');
    const btnResetFilters = document.getElementById('btnResetFilters');
    const btnEmptyReset = document.getElementById('btnEmptyReset');

    // Cart Elements
    const btnOpenCart = document.getElementById('btnOpenCart');
    const btnCloseCart = document.getElementById('btnCloseCart');
    const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartDrawerCount = document.getElementById('cartDrawerCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartDiscount = document.getElementById('cartDiscount');
    const discountRow = document.getElementById('discountRow');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');
    const inputPromoCode = document.getElementById('inputPromoCode');
    const btnApplyPromo = document.getElementById('btnApplyPromo');
    const promoMessage = document.getElementById('promoMessage');
    const btnCheckout = document.getElementById('btnCheckout');

    // Modal Elements
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewContent = document.getElementById('quickViewContent');
    const btnCloseQuickView = document.getElementById('btnCloseQuickView');
    const toast = document.getElementById('toast');

    // Init App
    function init() {
        loadCart();
        initTheme();
        bindEvents();
        render();
    }

    // Load Cart from LocalStorage
    function loadCart() {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
            try {
                cart = JSON.parse(saved);
            } catch (e) {
                cart = [];
            }
        }
    }

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    // Theme Toggle
    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY) || 'theme-dark';
        document.body.className = saved;
    }

    function toggleTheme() {
        if (document.body.classList.contains('theme-dark')) {
            document.body.className = 'theme-light';
            localStorage.setItem(THEME_KEY, 'theme-light');
            showToast('Switched to Light Mode');
        } else {
            document.body.className = 'theme-dark';
            localStorage.setItem(THEME_KEY, 'theme-dark');
            showToast('Switched to Dark Mode');
        }
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2600);
    }

    // Filter & Sort Logic
    function getFilteredProducts() {
        return products.filter(p => {
            if (activeCategory !== 'all' && p.category !== activeCategory) return false;
            if (p.price > maxPrice) return false;
            if (p.rating < minRating) return false;

            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const titleMatch = p.title.toLowerCase().includes(q);
                const descMatch = p.desc.toLowerCase().includes(q);
                const catMatch = p.category.toLowerCase().includes(q);
                if (!titleMatch && !descMatch && !catMatch) return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortMode === 'price-low') return a.price - b.price;
            if (sortMode === 'price-high') return b.price - a.price;
            if (sortMode === 'rating') return b.rating - a.rating;
            if (sortMode === 'name') return a.title.localeCompare(b.title);
            return 0; // 'featured'
        });
    }

    // Update Counts & Badges
    function updateSidebarCounts() {
        document.getElementById('countAll').textContent = products.length;
        document.getElementById('countHardware').textContent = products.filter(p => p.category === 'Hardware').length;
        document.getElementById('countAccessories').textContent = products.filter(p => p.category === 'Accessories').length;
        document.getElementById('countAudio').textContent = products.filter(p => p.category === 'Audio').length;
        document.getElementById('countApparel').textContent = products.filter(p => p.category === 'Apparel').length;
    }

    // Render Product Cards
    function render() {
        updateSidebarCounts();
        updateCartUI();

        const filtered = getFilteredProducts();
        productCount.textContent = filtered.length;

        if (filtered.length === 0) {
            productGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        productGrid.innerHTML = '';

        filtered.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';

            let badgeHtml = '';
            if (prod.badge) {
                badgeHtml = `<span class="badge-tag badge-${prod.badge}">${prod.badgeText}</span>`;
            }

            card.innerHTML = `
                <div class="product-image-box">
                    ${badgeHtml}
                    <span>${prod.icon}</span>
                </div>
                <div class="product-meta">
                    <span class="category-name">${prod.category}</span>
                    <span class="rating-stars">★ ${prod.rating.toFixed(1)}</span>
                </div>
                <h3 class="product-title">${escapeHtml(prod.title)}</h3>
                <p class="product-desc">${escapeHtml(prod.desc)}</p>
                <div class="product-card-footer">
                    <span class="product-price">$${prod.price}</span>
                    <div class="card-btns">
                        <button class="btn-icon-sm btn-quick-view" data-id="${prod.id}" title="Quick View">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button class="btn btn-primary btn-add-cart" data-id="${prod.id}">+ Add to Cart</button>
                    </div>
                </div>
            `;

            card.querySelector('.btn-quick-view').addEventListener('click', () => openQuickView(prod.id));
            card.querySelector('.btn-add-cart').addEventListener('click', () => addToCart(prod.id));

            productGrid.appendChild(card);
        });
    }

    // Cart Logic
    function addToCart(prodId) {
        const prod = products.find(p => p.id === prodId);
        if (!prod) return;

        const existing = cart.find(item => item.id === prodId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id: prodId, title: prod.title, price: prod.price, icon: prod.icon, qty: 1 });
        }

        saveCart();
        updateCartUI();
        showToast(`Added "${prod.title}" to cart!`);
    }

    function updateCartQty(prodId, delta) {
        const item = cart.find(i => i.id === prodId);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.id !== prodId);
            }
            saveCart();
            updateCartUI();
        }
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
        cartCountBadge.textContent = totalItems;
        cartDrawerCount.textContent = totalItems;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 40px;">Your shopping cart is currently empty.</p>';
            cartSubtotal.textContent = '$0.00';
            cartTax.textContent = '$0.00';
            cartTotal.textContent = '$0.00';
            discountRow.style.display = 'none';
            return;
        }

        cartItemsList.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div class="cart-item-img">${item.icon}</div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                    <div class="cart-item-price">$${item.price} &times; ${item.qty} = <strong>$${itemTotal}</strong></div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                </div>
            `;

            row.querySelector('.minus').addEventListener('click', () => updateCartQty(item.id, -1));
            row.querySelector('.plus').addEventListener('click', () => updateCartQty(item.id, 1));

            cartItemsList.appendChild(row);
        });

        const discount = subtotal * promoDiscount;
        const subAfterDiscount = subtotal - discount;
        const tax = subAfterDiscount * 0.08;
        const grandTotal = subAfterDiscount + tax;

        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (promoDiscount > 0) {
            discountRow.style.display = 'flex';
            cartDiscount.textContent = `-$${discount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }
        cartTax.textContent = `$${tax.toFixed(2)}`;
        cartTotal.textContent = `$${grandTotal.toFixed(2)}`;
    }

    // Quick View Modal
    function openQuickView(prodId) {
        const prod = products.find(p => p.id === prodId);
        if (!prod) return;

        quickViewContent.innerHTML = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="font-size: 4rem; width: 120px; height: 120px; background: var(--bg-primary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;">
                    ${prod.icon}
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <span style="font-size: 0.75rem; color: var(--accent-blue); font-weight: 700; text-transform: uppercase;">${prod.category} • ★ ${prod.rating}</span>
                    <h2 style="font-size: 1.25rem; font-weight: 700; margin: 4px 0 10px 0;">${escapeHtml(prod.title)}</h2>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 16px;">${escapeHtml(prod.desc)}</p>
                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-emerald); margin-bottom: 16px;">$${prod.price}</div>
                    <button id="btnQuickAdd" class="btn btn-primary" style="width: 100%;">Add to Cart</button>
                </div>
            </div>
        `;

        document.getElementById('btnQuickAdd').addEventListener('click', () => {
            addToCart(prod.id);
            closeQuickView();
        });

        quickViewModal.setAttribute('aria-hidden', 'false');
        quickViewModal.classList.add('show');
    }

    function closeQuickView() {
        quickViewModal.classList.remove('show');
        quickViewModal.setAttribute('aria-hidden', 'true');
    }

    // Event Bindings
    function bindEvents() {
        document.getElementById('btnToggleTheme').addEventListener('click', toggleTheme);

        // Cart Drawer toggle
        btnOpenCart.addEventListener('click', () => {
            cartDrawerBackdrop.setAttribute('aria-hidden', 'false');
            cartDrawerBackdrop.classList.add('show');
        });

        btnCloseCart.addEventListener('click', () => {
            cartDrawerBackdrop.classList.remove('show');
            cartDrawerBackdrop.setAttribute('aria-hidden', 'true');
        });

        // Quick View Close
        btnCloseQuickView.addEventListener('click', closeQuickView);

        // Category clicks
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                activeCategory = item.dataset.cat;
                render();
            });
        });

        // Search Input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            render();
        });

        // Price Range
        priceRange.addEventListener('input', (e) => {
            maxPrice = parseInt(e.target.value, 10);
            priceValue.textContent = `$${maxPrice}`;
            render();
        });

        // Rating Filter Radios
        document.querySelectorAll('input[name="ratingFilter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                minRating = parseFloat(e.target.value);
                render();
            });
        });

        // Sort Select
        sortSelect.addEventListener('change', (e) => {
            sortMode = e.target.value;
            render();
        });

        // Reset Buttons
        const resetAll = () => {
            activeCategory = 'all';
            searchQuery = '';
            maxPrice = 300;
            minRating = 0;
            sortMode = 'featured';
            searchInput.value = '';
            priceRange.value = 300;
            priceValue.textContent = '$300';
            document.querySelector('input[name="ratingFilter"][value="0"]').checked = true;
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            document.querySelector('.category-item[data-cat="all"]').classList.add('active');
            render();
        };

        btnResetFilters.addEventListener('click', resetAll);
        btnEmptyReset.addEventListener('click', resetAll);

        // Promo Banner code button
        document.getElementById('btnPromoBanner').addEventListener('click', () => {
            inputPromoCode.value = 'NIMBUS10';
            btnOpenCart.click();
            showToast('Applied 10% discount code NIMBUS10 to cart drawer!');
        });

        // Apply Promo
        btnApplyPromo.addEventListener('click', () => {
            const code = inputPromoCode.value.trim().toUpperCase();
            if (code === 'NIMBUS10') {
                promoDiscount = 0.1;
                promoMessage.textContent = '✓ 10% Discount Code Applied!';
                promoMessage.style.color = 'var(--accent-emerald)';
                updateCartUI();
            } else {
                promoDiscount = 0;
                promoMessage.textContent = 'Invalid promo code. Try NIMBUS10';
                promoMessage.style.color = 'var(--accent-rose)';
                updateCartUI();
            }
        });

        // Checkout Button
        btnCheckout.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty!');
                return;
            }
            alert('🎉 Order Placed Successfully!\nThank you for practicing with Nimbus Store Studio.');
            cart = [];
            promoDiscount = 0;
            inputPromoCode.value = '';
            promoMessage.textContent = '';
            saveCart();
            updateCartUI();
            btnCloseCart.click();
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    document.addEventListener('DOMContentLoaded', init);

})();
