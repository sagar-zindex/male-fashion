document.addEventListener('DOMContentLoaded', function () {

     document.body.addEventListener('click', function (e) {
          const btn = e.target.closest('.add-cart-btn');
          if (!btn) return;

          e.preventDefault();

          const variantId = btn.dataset.variantId;
          if (!variantId) return;

          btn.classList.add('loading');
          btn.textContent = 'Adding...';

          fetch('/cart/add.js', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
               },
               body: JSON.stringify({
                    id: variantId,
                    quantity: 1
               })
          })
               .then(res => {
                    if (!res.ok) throw new Error('Add to cart failed');
                    return res.json();
               })
               .then(item => {
                    btn.textContent = 'Added ✓';

                    // 🔔 Notify cart update
                    document.dispatchEvent(new CustomEvent('cart:updated', {
                         detail: item
                    }));
               })
               .catch(err => {
                    console.error(err);
                    btn.textContent = 'Error';
               })
               .finally(() => {
                    setTimeout(() => {
                         btn.textContent = '+ Add To Cart';
                         btn.classList.remove('loading');
                    }, 1500);
               });
     });

});


function formatMoney(cents, format) {
     if (typeof cents === 'string') {
          cents = cents.replace('.', '');
     }

     let value = (cents / 100).toFixed(2);
     let formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

     // Default currency symbol (₹ / $ / etc.)
     const currency = window.Shopify?.currency?.active || '';

     return currency ? `${currency} ${formatted}` : formatted;
}

function updateCartHeader() {
     fetch('/cart.js')
          .then(res => res.json())
          .then(cart => {

               // Update cart count
               document.querySelectorAll('.cart-count').forEach(el => {
                    el.textContent = cart.item_count;
               });

               // ✅ Update total price (FIXED)
               document.querySelectorAll('.cart-total-price').forEach(el => {
                    el.textContent = formatMoney(cart.total_price);
               });

          })
          .catch(err => console.error('Cart update error:', err));
}

// Listen to cart updates
document.addEventListener('cart:updated', updateCartHeader);

// Initial load
document.addEventListener('DOMContentLoaded', updateCartHeader);

