// checkout.js - Complete Logic for Checkout Page

document.addEventListener("DOMContentLoaded", () => {
  const productsList = document.getElementById("productsList");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const discountEl = document.getElementById("productDiscount");
  const voucherDiscountEl = document.getElementById("voucherDiscount");
  const totalEl = document.getElementById("total");
  const voucherSelect = document.getElementById("voucherSelect");
  const applyVoucherBtn = document.getElementById("applyVoucherBtn");
  const voucherApplied = document.getElementById("voucherApplied");
  const voucherNotification = document.getElementById("voucherNotification");
  const secretCodeInput = document.getElementById("secretCode");
  const applySecretBtn = document.getElementById("applySecretBtn");
  const codeApplied = document.getElementById("codeApplied");
  const codeNotification = document.getElementById("codeNotification");
  const addressList = document.getElementById("addressList");
  const addAddressBtn = document.getElementById("addAddressBtn");
  const addressModal = document.getElementById("addressModal");
  const closeModal = document.getElementById("closeModal");
  const addressForm = document.getElementById("addressForm");
  const confirmationModal = document.getElementById("confirmationModal");
  const continueShoppingBtn = document.getElementById("continueShoppingBtn");
  const moreOptionsBtn = document.getElementById("moreOptionsBtn");
  const morePaymentOptions = document.getElementById("morePaymentOptions");
  const checkoutBtn = document.getElementById("checkoutBtn");

  let activeVoucher = null;
  let activeSecretCode = null;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let addresses = JSON.parse(localStorage.getItem("addresses")) || [];
  let selectedAddress = null;

  // Initialize the page
  function initCheckoutPage() {
    displayCartItems();
    loadVouchers();
    loadAddresses();
    updateSummary();
    setupEventListeners();
    updateCartCount();
  }

  // Load and display cart products
  function displayCartItems() {
    productsList.innerHTML = "";

    if (cart.length === 0) {
      productsList.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    cart.forEach((item) => {
      const itemEl = document.createElement("div");
      itemEl.className = "checkout-product";
      itemEl.innerHTML = `
                <div class="product-info">
                    <img src="/${item.image}" alt="${
        item.name
      }" class="product-thumbnail">
                    <div>
                        <strong>${item.name}</strong>
                        <p>${item.size ? "Size: " + item.size : ""} ${
        item.color ? "| Color: " + item.color : ""
      }</p>
                        <p>Qty: ${item.quantity}</p>
                    </div>
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
            `;
      productsList.appendChild(itemEl);
    });
  }

  // Load vouchers from localStorage
  function loadVouchers() {
    voucherSelect.innerHTML =
      '<option value="" disabled selected>Choose your voucher</option>';

    const claimedVouchers =
      JSON.parse(localStorage.getItem("claimedVouchers")) || [];
    const now = new Date();
    const validDuration = 60 * 60 * 1000; // 1 hour validity

    const validVouchers = claimedVouchers.filter((v) => {
      const claimedTime = new Date(v.claimedAt);
      return now - claimedTime < validDuration;
    });

    localStorage.setItem("claimedVouchers", JSON.stringify(validVouchers));

    validVouchers.forEach((v) => {
      const option = document.createElement("option");
      option.value = JSON.stringify(v);
      option.textContent = `${v.title} - ${v.description}`;
      voucherSelect.appendChild(option);
    });
  }

  // Load addresses from localStorage
  function loadAddresses() {
    addressList.innerHTML = "";

    if (addresses.length === 0) {
      addressList.innerHTML =
        "<p>No addresses saved. Please add an address.</p>";
      return;
    }

    addresses.forEach((address, index) => {
      const addressEl = document.createElement("div");
      addressEl.className = `address-item ${
        address.isDefault ? "selected" : ""
      }`;
      addressEl.innerHTML = `
                <h4>${address.recipientName}</h4>
                <p>${address.phoneNumber}</p>
                <p>${address.fullAddress}, ${address.city}, ${
        address.province
      } ${address.postalCode}</p>
                <div class="address-actions">
                    <button class="set-default-btn" data-index="${index}">
                        <i class="fas ${
                          address.isDefault ? "fa-check-circle" : "fa-circle"
                        }"></i>
                        ${
                          address.isDefault
                            ? "Default Address"
                            : "Set as Default"
                        }
                    </button>
                    <button class="remove-address-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;

      if (address.isDefault) {
        selectedAddress = address;
      }

      addressList.appendChild(addressEl);
    });

    // Add event listeners for address actions
    document.querySelectorAll(".set-default-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        setDefaultAddress(index);
      });
    });

    document.querySelectorAll(".remove-address-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        removeAddress(index);
      });
    });

    document.querySelectorAll(".address-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (
          !e.target.classList.contains("address-actions") &&
          !e.target.classList.contains("set-default-btn") &&
          !e.target.classList.contains("remove-address-btn")
        ) {
          const index = parseInt(
            item.querySelector(".set-default-btn").dataset.index
          );
          selectAddress(index);
        }
      });
    });
  }

  // Set default address
  function setDefaultAddress(index) {
    addresses = addresses.map((address, i) => ({
      ...address,
      isDefault: i === index,
    }));

    localStorage.setItem("addresses", JSON.stringify(addresses));
    loadAddresses();
    updateSummary();
  }

  // Select address for this order
  function selectAddress(index) {
    selectedAddress = addresses[index];
    document.querySelectorAll(".address-item").forEach((item) => {
      item.classList.remove("selected");
    });
    document
      .querySelector(`.address-item:nth-child(${index + 1})`)
      .classList.add("selected");
  }

  // Remove address
  function removeAddress(index) {
    if (confirm("Are you sure you want to remove this address?")) {
      addresses.splice(index, 1);
      localStorage.setItem("addresses", JSON.stringify(addresses));
      loadAddresses();

      if (selectedAddress && addresses.length > 0) {
        // Set another address as default if needed
        const defaultExists = addresses.some((addr) => addr.isDefault);
        if (!defaultExists) {
          addresses[0].isDefault = true;
          localStorage.setItem("addresses", JSON.stringify(addresses));
          loadAddresses();
        }
      } else {
        selectedAddress = null;
      }
    }
  }

  // Add new address
  function addAddress(newAddress) {
    // If this is the first address, set as default
    if (addresses.length === 0) {
      newAddress.isDefault = true;
    }

    addresses.push(newAddress);
    localStorage.setItem("addresses", JSON.stringify(addresses));
    loadAddresses();
    hideAddressModal();
  }

  // Show address modal
  function showAddressModal() {
    addressModal.style.display = "flex";
    setTimeout(() => {
      addressModal.classList.add("show");
    }, 10);
  }

  // Hide address modal
  function hideAddressModal() {
    addressModal.classList.remove("show");
    setTimeout(() => {
      addressModal.style.display = "none";
    }, 300);
  }

  // Update checkout summary
  function updateSummary() {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    );
    const productDiscount = cart.reduce(
      (sum, item) =>
        item.originalPrice
          ? sum + (item.originalPrice - item.price) * item.quantity
          : sum,
      0
    );

    let shipping = getSelectedShippingPrice();
    let voucherDiscount = 0;
    let secretCodeDiscount = 0;
    let secretCodeShippingDiscount = 0;

    // Apply voucher discount if any
    if (activeVoucher) {
      if (activeVoucher.title.toLowerCase().includes("free shipping")) {
        shipping = 0;
      } else {
        const percentMatch = activeVoucher.title.match(/(\d+)%/);
        const maxMatch = activeVoucher.description.match(/Max (\d+)K/i);
        const minSpendMatch =
          activeVoucher.description.match(/Min Spend (\d+)K/i);

        const percent = percentMatch ? parseInt(percentMatch[1]) : 0;
        const max = maxMatch ? parseInt(maxMatch[1]) * 1000 : Infinity;
        const minSpend = minSpendMatch ? parseInt(minSpendMatch[1]) * 1000 : 0;

        if (subtotal >= minSpend) {
          voucherDiscount = Math.min((subtotal * percent) / 100, max);
        }
      }
    }

    // Apply secret code discounts if any
    if (activeSecretCode) {
      switch (activeSecretCode) {
        case "Luxura1":
          // Free shipping
          secretCodeShippingDiscount = shipping;
          break;
        case "Luxura2":
          // 50k discount, no minimum spend
          secretCodeDiscount = 50000;
          break;
        case "Luxura3":
          // 100k discount, min spend 600k
          if (subtotal >= 600000) {
            secretCodeDiscount = 100000;
          }
          break;
      }
    }

    // Calculate total
    const total = Math.max(
      0,
      subtotal +
        shipping -
        productDiscount -
        voucherDiscount -
        secretCodeDiscount -
        secretCodeShippingDiscount
    );

    // Update UI
    subtotalEl.textContent = formatPrice(subtotal);
    shippingEl.textContent = formatPrice(shipping - secretCodeShippingDiscount);
    discountEl.textContent = "-" + formatPrice(productDiscount);
    voucherDiscountEl.textContent =
      "-" + formatPrice(voucherDiscount + secretCodeDiscount);
    totalEl.textContent = formatPrice(total);
  }

  // Get selected shipping price
  function getSelectedShippingPrice() {
    const selected = document.querySelector("input[name='shipping']:checked");
    if (selected && selected.id === "standard") return 15000;
    if (selected && selected.id === "express") return 30000;
    if (selected && selected.id === "same-day") return 50000;
    return 0;
  }

  // Format price with IDR currency
  function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  // Show notification
  function showNotification(element, message, isError = false) {
    element.innerHTML = `
            <div class="voucher-toast ${isError ? "error" : "success"}">
                <i class="fas ${
                  isError ? "fa-exclamation-circle" : "fa-check-circle"
                }"></i>
                ${message}
            </div>
        `;
    element.style.display = "block";
    setTimeout(() => (element.style.display = "none"), 4000);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Voucher application
    applyVoucherBtn.addEventListener("click", () => {
      if (!voucherSelect.value) {
        showNotification(
          voucherNotification,
          "Please select a voucher first",
          true
        );
        return;
      }

      activeVoucher = JSON.parse(voucherSelect.value);
      voucherApplied.innerHTML = `<strong>${activeVoucher.title}</strong> - ${activeVoucher.description}`;
      showNotification(
        voucherNotification,
        `Voucher "${activeVoucher.title}" applied!`
      );
      updateSummary();
    });

    // Secret code application
    applySecretBtn.addEventListener("click", () => {
      const secretCode = secretCodeInput.value.trim();

      if (!secretCode) {
        showNotification(codeNotification, "Please enter a secret code", true);
        return;
      }

      const validCodes = ["Luxura1", "Luxura2", "Luxura3"];

      if (!validCodes.includes(secretCode)) {
        showNotification(codeNotification, "Invalid secret code", true);
        return;
      }

      activeSecretCode = secretCode;

      let message = "";
      switch (secretCode) {
        case "Luxura1":
          message = "Free shipping applied!";
          break;
        case "Luxura2":
          message = "IDR 50,000 discount applied!";
          break;
        case "Luxura3":
          const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          if (subtotal >= 600000) {
            message = "IDR 100,000 discount applied!";
          } else {
            message =
              "IDR 100,000 discount will apply when your order reaches IDR 600,000";
          }
          break;
      }

      codeApplied.innerHTML = `<strong>Secret Code: ${secretCode}</strong> - ${message}`;
      showNotification(codeNotification, message);
      updateSummary();
    });

    // Shipping method change
    document.querySelectorAll("input[name='shipping']").forEach((radio) => {
      radio.addEventListener("change", updateSummary);
    });

    // Address modal
    addAddressBtn.addEventListener("click", showAddressModal);
    closeModal.addEventListener("click", hideAddressModal);
    addressModal.addEventListener("click", (e) => {
      if (e.target === addressModal) {
        hideAddressModal();
      }
    });

    // Address form submission
    addressForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newAddress = {
        recipientName: document.getElementById("recipientName").value,
        phoneNumber: document.getElementById("phoneNumber").value,
        province: document.getElementById("province").value,
        city: document.getElementById("city").value,
        postalCode: document.getElementById("postalCode").value,
        fullAddress: document.getElementById("fullAddress").value,
        isDefault: document.getElementById("defaultAddress").checked,
      };

      addAddress(newAddress);
      addressForm.reset();
    });

    // Payment options
    moreOptionsBtn.addEventListener("click", () => {
      const isHidden = morePaymentOptions.style.display === "none";
      morePaymentOptions.style.display = isHidden ? "block" : "none";
      moreOptionsBtn.textContent = isHidden
        ? "Show Less Options"
        : "Show More Options";
    });

    // Checkout button
    checkoutBtn.addEventListener("click", () => {
      if (!selectedAddress) {
        showNotification(
          voucherNotification,
          "Please select a delivery address",
          true
        );
        return;
      }

      if (cart.length === 0) {
        showNotification(voucherNotification, "Your cart is empty", true);
        return;
      }

      // Get selected payment method
      const selectedPayment = document.querySelector(
        "input[name='payment']:checked"
      );
      if (!selectedPayment) {
        showNotification(
          voucherNotification,
          "Please select a payment method",
          true
        );
        return;
      }

      // Process checkout
      processCheckout(selectedPayment.id);
    });

    // Continue shopping button
    continueShoppingBtn?.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // Process checkout
  function processCheckout(paymentMethod) {
    // In a real app, you would send this data to your backend
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const productDiscount = cart.reduce(
      (sum, item) =>
        item.originalPrice
          ? sum + (item.originalPrice - item.price) * item.quantity
          : sum,
      0
    );
    const shipping = getSelectedShippingPrice();

    let voucherDiscount = 0;
    let secretCodeDiscount = 0;
    let secretCodeShippingDiscount = 0;

    if (activeVoucher) {
      if (activeVoucher.title.toLowerCase().includes("free shipping")) {
        secretCodeShippingDiscount = shipping;
      } else {
        const percentMatch = activeVoucher.title.match(/(\d+)%/);
        const maxMatch = activeVoucher.description.match(/Max (\d+)K/i);
        const minSpendMatch =
          activeVoucher.description.match(/Min Spend (\d+)K/i);

        const percent = percentMatch ? parseInt(percentMatch[1]) : 0;
        const max = maxMatch ? parseInt(maxMatch[1]) * 1000 : Infinity;
        const minSpend = minSpendMatch ? parseInt(minSpendMatch[1]) * 1000 : 0;

        if (subtotal >= minSpend) {
          voucherDiscount = Math.min((subtotal * percent) / 100, max);
        }
      }
    }

    if (activeSecretCode) {
      switch (activeSecretCode) {
        case "Luxura1":
          secretCodeShippingDiscount = shipping;
          break;
        case "Luxura2":
          secretCodeDiscount = 50000;
          break;
        case "Luxura3":
          if (subtotal >= 600000) {
            secretCodeDiscount = 100000;
          }
          break;
      }
    }

    const total = Math.max(
      0,
      subtotal +
        shipping -
        productDiscount -
        voucherDiscount -
        secretCodeDiscount -
        secretCodeShippingDiscount
    );

    // Generate order ID
    const orderId = `LX-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    // Update confirmation modal
    document.getElementById("orderId").textContent = orderId;
    document.getElementById(
      "deliveryAddress"
    ).textContent = `${selectedAddress.recipientName}, ${selectedAddress.city}, ${selectedAddress.province}`;

    let paymentMethodText = "";
    switch (paymentMethod) {
      case "credit-card":
        paymentMethodText = "Credit Card";
        break;
      case "bank-transfer":
        paymentMethodText = "Bank Transfer";
        break;
      case "e-wallet":
        paymentMethodText = "E-Wallet";
        break;
      case "paypal":
        paymentMethodText = "PayPal";
        break;
      case "cod":
        paymentMethodText = "Cash on Delivery";
        break;
      default:
        paymentMethodText = paymentMethod;
    }

    document.getElementById("paymentMethod").textContent = paymentMethodText;
    document.getElementById("totalPaid").textContent = formatPrice(total);

    // Show confirmation modal
    confirmationModal.style.display = "flex";
    setTimeout(() => {
      confirmationModal.classList.add("show");
    }, 10);

    // Clear cart
    localStorage.removeItem("cart");
  }

  // Update cart count in navbar
  function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById("cartCount");

    if (cartCountElement) {
      if (count > 0) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = "flex";
      } else {
        cartCountElement.style.display = "none";
      }
    }
  }

  // Initialize the page
  initCheckoutPage();
});
