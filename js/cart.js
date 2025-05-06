document.addEventListener("DOMContentLoaded", () => {
  initCart();
});

function initCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const subtotalElement = document.getElementById("subtotal");
  const discountElement = document.getElementById("productDiscount");
  const totalElement = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const cartCount = document.getElementById("cartCount");

  let products = [];
  let activeVoucher = null;

  fetch("../data/product.json")
    .then((response) => response.json())
    .then((data) => {
      products = data;
      loadCart();
    })
    .catch((error) => console.error("Error loading products:", error));

  function loadCart() {
    const cart = getCart();
    displayCartItems(cart);
    updateCartSummary(cart);
    updateCartCount(cart);
  }

  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function displayCartItems(cart) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet</p>
          <a href="product.html" class="btn">Continue Shopping</a>
        </div>`;
      return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id) || {};
      const discountPercentage = calculateDiscountPercentage(item);
      const cartItemElement = createCartItemElement(
        item,
        product,
        discountPercentage
      );
      cartItemsContainer.appendChild(cartItemElement);
      addCartItemEventListeners(cartItemElement, item);
    });
  }

  function calculateDiscountPercentage(item) {
    if (!item.originalPrice) return 0;
    return Math.round(
      ((item.originalPrice - item.price) / item.originalPrice) * 100
    );
  }

  function createCartItemElement(item, product, discountPercentage) {
    const element = document.createElement("div");
    element.className = "cart-item";
    element.dataset.id = item.id;

    element.innerHTML = `
      <div class="cart-item-image">
        <img src="/${getSelectedImage(item, product)}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <div>
          <h3 class="cart-item-title">${item.name}</h3>
          <div class="cart-item-meta">
            ${
              item.color
                ? `<span><i class="fas fa-palette"></i> ${item.color}</span>`
                : ""
            }
            ${
              item.size
                ? `<span><i class="fas fa-ruler"></i> ${item.size}</span>`
                : ""
            }
          </div>
          <div class="cart-item-price">
            <span class="current-price">${formatPrice(item.price)}</span>
            ${
              item.originalPrice
                ? `<span class="original-price">${formatPrice(
                    item.originalPrice
                  )}</span>`
                : ""
            }
            <div class="item-subtotal">
  Subtotal: <span class="item-subtotal-value">${formatPrice(
    item.price * item.quantity
  )}</span>
</div>


          </div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="decrement">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="increment">+</button>
          </div>
          <button class="remove-item">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>`;
    return element;
  }

  function getSelectedImage(item, product) {
    if (item.color && product.images && product.images[item.color]) {
      return product.images[item.color];
    }
    return item.image || product.image;
  }

  function addCartItemEventListeners(element, item) {
    const decrementBtn = element.querySelector(".decrement");
    const incrementBtn = element.querySelector(".increment");
    const quantityElement = element.querySelector(".quantity");
    const removeBtn = element.querySelector(".remove-item");

    decrementBtn.addEventListener("click", () =>
      updateQuantity(item, -1, quantityElement)
    );
    incrementBtn.addEventListener("click", () =>
      updateQuantity(item, 1, quantityElement)
    );
    removeBtn.addEventListener("click", () => removeItem(item, element));
  }

  function updateQuantity(item, change, quantityElement) {
    const cart = getCart();
    const itemIndex = findCartItemIndex(cart, item);

    if (itemIndex === -1) return;

    const newQuantity = cart[itemIndex].quantity + change;
    if (newQuantity < 1) {
      removeItem(item);
      return;
    }

    cart[itemIndex].quantity = newQuantity;
    saveCart(cart);

    quantityElement.textContent = newQuantity;
    updateCartSummary(cart);
    updateCartCount(cart);
    const subtotalPerItem = quantityElement
      .closest(".cart-item")
      .querySelector(".item-subtotal-value");
    subtotalPerItem.textContent = formatPrice(
      cart[itemIndex].price * newQuantity
    );
  }

  function removeItem(item, element) {
    const cart = getCart().filter(
      (cartItem) =>
        !(
          cartItem.id === item.id &&
          cartItem.size === item.size &&
          cartItem.color === item.color
        )
    );
    saveCart(cart);
    element?.remove();
    updateCartSummary(cart);
    updateCartCount(cart);

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet</p>
          <a href="index.html" class="btn">Continue Shopping</a>
        </div>`;
    }
  }

  function findCartItemIndex(cart, item) {
    return cart.findIndex(
      (cartItem) =>
        cartItem.id === item.id &&
        cartItem.size === item.size &&
        cartItem.color === item.color
    );
  }

  function updateCartSummary(cart) {
    const subtotal = calculateSubtotal(cart);
    const productDiscount = calculateDiscount(cart);
    const total = Math.max(0, subtotal - productDiscount);

    subtotalElement.textContent = formatPrice(subtotal);
    discountElement.textContent = `-${formatPrice(productDiscount)}`;
    totalElement.textContent = formatPrice(total);
  }

  function calculateSubtotal(cart) {
    return cart.reduce((sum, item) => {
      const original = item.originalPrice || item.price;
      return sum + original * item.quantity;
    }, 0);
  }

  function calculateDiscount(cart) {
    return cart.reduce((sum, item) => {
      return item.originalPrice
        ? sum + (item.originalPrice - item.price) * item.quantity
        : sum;
    }, 0);
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  function updateCartCount(cart) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
      // Pastikan elemen cartCount ada
      if (count > 0) {
        cartCount.textContent = count;
        cartCount.style.display = "flex"; // Tampilkan badge
      } else {
        cartCount.style.display = "none"; // Sembunyikan badge
      }
    }
  }

  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    window.location.href = "checkout.html";
  });

  // Voucher claim => langsung redirect
  document.querySelectorAll(".voucher-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const voucherBox = btn.closest(".voucher");
      const title = voucherBox.querySelector("h1")?.textContent.trim();
      const description = voucherBox.querySelector("p")?.textContent.trim();

      const now = new Date().toISOString();
      const voucherData = { title, description, claimedAt: now };

      let claimedVouchers =
        JSON.parse(localStorage.getItem("claimedVouchers")) || [];

      const alreadyClaimed = claimedVouchers.some(
        (v) => v.title === title && v.description === description
      );

      if (!alreadyClaimed) {
        claimedVouchers.push(voucherData);
        localStorage.setItem(
          "claimedVouchers",
          JSON.stringify(claimedVouchers)
        );
        showCustomAlert(`Voucher "${title}" berhasil diklaim!`);
      } else {
        showCustomAlert(`Voucher "${title}" sudah diklaim sebelumnya.`, true);
      }
    });
  });

  function showCustomAlert(message, isError = false) {
    const alertBox = document.createElement("div");
    alertBox.className = `custom-alert ${isError ? "error" : "success"}`;

    alertBox.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span class="alert-icon">${isError ? "⚠️" : "✓"}</span>
        <span>${message}</span>
      </div>
      <button class="close-alert">&times;</button>
    `;

    document.body.appendChild(alertBox);

    // Trigger reflow untuk memulai animasi
    void alertBox.offsetWidth;

    alertBox.classList.add("show");

    // Close button handler
    const closeBtn = alertBox.querySelector(".close-alert");
    closeBtn.addEventListener("click", () => {
      alertBox.classList.remove("show");
      setTimeout(() => {
        alertBox.remove();
      }, 300);
    });

    // Auto-hide setelah 5 detik
    setTimeout(() => {
      alertBox.classList.remove("show");
      setTimeout(() => {
        alertBox.remove();
      }, 300);
    }, 5000);
  }
}
