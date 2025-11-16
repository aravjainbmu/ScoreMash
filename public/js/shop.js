// Shop Manager Class - handles product filtering, sorting, and cart functionality
function isValidUrl(str) {
    try { 
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

class ShopManager {
    constructor(products, categories, brands) {
        this.allProducts = products;             
        this.filteredProducts = [...products];    // Products after filtering 
        this.categories = categories;             
        this.brands = brands;                
        
        // Current filter settings
        this.currentFilters = {
            category: 'all',     
            brand: 'all',         
            minPrice: 0,          
            maxPrice: 1000,       
            search: ''            
        };
        
        this.sortBy = 'default';  //('default', 'price-low', etc.)
        this.init();              // Setup
    }

    init() {
        this.initializePriceSlider();
        this.setupEventListeners();
        this.renderProducts();
    }

    setupEventListeners() {
        // Category filter
        const categoryContainer = document.getElementById('categoryFilters');
        if (categoryContainer) {
            categoryContainer.addEventListener('change', (e) => {
                if (e.target.type === 'radio' && e.target.name === 'category') {
                    this.currentFilters.category = e.target.value;
                    this.applyFilters();
                }
            });
        }

        // Brand filter
        const brandContainer = document.getElementById('brandFilters');
        if (brandContainer) {
            brandContainer.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox' && e.target.name === 'brand') {
                    this.updateBrandFilter();
                    this.applyFilters();
                }
            });
        }

        // Price range
        const priceSlider = document.getElementById('priceRange');
        if (priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                this.currentFilters.maxPrice = parseInt(e.target.value) || 1000;
                this.updatePriceDisplay();
                this.applyFilters();
            });
        }

        // Search
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Sort dropdown
        const sortSelect = document.getElementById('sortProducts');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.sortProducts();
                this.renderProducts();
            });
        }
    }

    initializePriceSlider() {
        // Setup max price for the slider
        const maxPrice = Math.max(...this.allProducts.map(p => p.price || 0), 1000);
        const priceSlider = document.getElementById('priceRange');
        if (priceSlider) {
            priceSlider.max = maxPrice;
            priceSlider.value = maxPrice;
            this.currentFilters.maxPrice = maxPrice;
            this.updatePriceDisplay();
        }
    }

    updateBrandFilter() {
        const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
            .map(cb => cb.value);
        
        if (selectedBrands.length === 0) {
            this.currentFilters.brand = 'all';
        } else {
            this.currentFilters.brand = selectedBrands;
        }
    }

    updatePriceDisplay() {
        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay) {
            priceDisplay.textContent = `$${this.currentFilters.minPrice} - $${this.currentFilters.maxPrice}`;
        }
    }

    // Apply all filters to show only matching products
    applyFilters() {
        this.filteredProducts = this.allProducts.filter(product => {
            if (!product) return false;

            // Category filter
            if (this.currentFilters.category !== 'all') {
                const productCategory = (product.category || '').trim();
                const filterCategory = (this.currentFilters.category || '').trim();
                if (productCategory !== filterCategory) {
                    return false;
                }
            }

            // Brand filter
            if (this.currentFilters.brand !== 'all') {
                const productBrand = (product.brand || '').trim();
                if (Array.isArray(this.currentFilters.brand)) {
                    // Check if product brand is in the list
                    const selectedBrands = this.currentFilters.brand.map(b => (b || '').trim());
                    if (!selectedBrands.includes(productBrand)) {
                        return false;
                    }
                } else {
                    const filterBrand = (this.currentFilters.brand || '').trim();
                    if (productBrand !== filterBrand) {
                        return false;
                    }
                }
            }

            // Price filter
            const productPrice = parseFloat(product.price) || 0;
            const minPrice = parseFloat(this.currentFilters.minPrice) || 0;
            const maxPrice = parseFloat(this.currentFilters.maxPrice) || 1000;
            if (productPrice < minPrice || productPrice > maxPrice) {
                return false;
            }

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = (this.currentFilters.search || '').toLowerCase().trim();
                if (searchTerm) {
                    // Combine product name, brand, and category into one searchable string
                    const searchableText = `${product.name || ''} ${product.brand || ''} ${product.category || ''}`.toLowerCase();
                    if (!searchableText.includes(searchTerm)) {
                        return false;
                    }
                }
            }

            return true;  // Product matches all filters
        });

        // After filtering, sort the products and display them
        this.sortProducts();
        this.renderProducts();
    }

    sortProducts() {
        switch (this.sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep original order
                break;
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = '<p class="no-products">No products found matching your filters.</p>';
            return;
        }

        productsGrid.innerHTML = this.filteredProducts.map(product => {
            const stock = product.stock || 0;
            const isOutOfStock = stock <= 0;
            const avgRating = product.userReviews && product.userReviews.length > 0 
                ? (product.userReviews.reduce((sum, r) => sum + r.rating, 0) / product.userReviews.length).toFixed(1)
                : (product.rating || 0);
            const reviewCount = product.userReviews ? product.userReviews.length : (product.reviews || 0);
            return `
            <a href="/shop/${product.id}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image">${isValidUrl(product.image) ? "<img src='"+product.image+"' width='80%' height='80%'>" : product.image || '🏏'}</div>
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        <span class="stars">${this.generateStars(avgRating)}</span>
                        <span class="rating-text">(${reviewCount})</span>
                    </div>
                    <div style="font-size: 12px; color: var(--darkgrey); margin-bottom: 8px; margin-left: 12px;">
                        Stock: ${stock}
                    </div>
                    <button class="add-to-cart-btn" data-product-id="${product.id}" onclick="event.preventDefault(); event.stopPropagation(); shopManager.addToCart('${product.id}', 1);" ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </a>
        `;
        }).join('');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '½';
        stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
        return stars;
    }

    async addToCart(productId, quantity = 1) {
        try {
            // Check if user is logged in
            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification('Product added to cart!');
                this.updateCartCount();
            } else {
                if (response.status === 401) {
                    this.showNotification('Please login to add items to cart', 'error');
                    setTimeout(() => {
                        window.location.href = '/auth/signin';
                    }, 2000);
                } else if (response.status === 403) {
                    this.showNotification('Admins cannot add items to cart', 'error');
                } else {
                    this.showNotification(result.error || 'Failed to add product to cart', 'error');
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding product to cart', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#22c55e' : '#ef4444'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateCartCount() {
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }
}

// Initialize ShopManager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Products data passed from server via EJS
    if (typeof window.productsData !== 'undefined') {
        window.shopManager = new ShopManager(
            window.productsData.products,
            window.productsData.categories,
            window.productsData.brands
        );
    } else {
        console.error('Error loading products:');
    }
});

