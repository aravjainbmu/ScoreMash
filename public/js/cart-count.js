document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Make it available globally
window.updateCartCount = function updateCartCount() {
    fetch('/cart/count')
        .then(response => response.json())
        .then(data => {
            const cartIcon = document.querySelector('a[href="/cart"]');
            if (cartIcon) {
                let badge = cartIcon.querySelector('.cart-badge');
                if (data.count > 0) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'cart-badge';
                        badge.style.cssText = 'position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;';
                        cartIcon.style.position = 'relative';
                        cartIcon.appendChild(badge);
                    }
                    badge.textContent = data.count > 99 ? '99+' : data.count;
                } else if (badge) {
                    badge.remove();
                }
            }
        })
        .catch(error => {
            console.error('Error updating cart count:', error);
        });
}




