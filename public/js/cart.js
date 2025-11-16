document.addEventListener('DOMContentLoaded', () => {
    // Update cart button
    const updateCartBtn = document.querySelector('.update-cart-btn');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', updateCart);
    }

    // Remove item buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-btn')) {
            const btn = e.target.closest('.remove-btn');
            const productId = btn.dataset.itemId;
            if (productId) {
                removeFromCart(productId);
            }
        }
    });
});

async function updateCart() {
    const quantityInputs = document.querySelectorAll('.qty-input');
    const updates = [];

    for (const input of quantityInputs) {
        const productId = input.dataset.itemId;
        const quantity = parseInt(input.value);
        
        if (productId && quantity > 0) {
            updates.push({ productId, quantity });
        }
    }

    if (updates.length === 0) {
        showNotification('No items to update', 'error');
        return;
    }

    try {
        const resultsData = [];

        for (const item of updates) {
            const response = await fetch('/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });

            const json = await response.json();
            resultsData.push(json);

            if (!json.success) break;
        }
       
        const allSuccess = resultsData.every(r => r.success);
        
        if (allSuccess) {
            showNotification('Cart updated successfully!');
            if (typeof window.updateCartCount === 'function') {
                window.updateCartCount();
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            // Show error message from first failed update
            const firstError = resultsData.find(r => !r.success);
            showNotification(firstError?.error || 'Error updating cart', 'error');
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        showNotification('Error updating cart', 'error');
    }
}

async function removeFromCart(productId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }

    try {
        const response = await fetch('/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Item removed from cart');
            if (typeof window.updateCartCount === 'function') {
                window.updateCartCount();
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showNotification(result.error || 'Error removing item', 'error');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing item', 'error');
    }
}

function showNotification(message, type = 'success') {
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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation keyframes if not already present
if (!document.getElementById('cart-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}




