// DOM Elements
const navLinks = document.getElementById("navLinks");
const hamburger = document.getElementById("hamburger");
const searchInput = document.getElementById("searchInput");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const slider = document.getElementById("slider");
const sliderDots = document.getElementById("sliderDots");
const discountProducts = document.getElementById("discountProducts");
const newProducts = document.getElementById("newProducts");
const categoryTabs = document.getElementById("categoryTabs");
const categoryProducts = document.getElementById("categoryProducts");
const productModal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const modalBody = document.getElementById("modalBody");
const newsletterForm = document.getElementById("newsletterForm");
const searchBox = document.getElementById("searchBox");
const searchIcon = document.getElementById("searchIcon");

// Global Variables
let currentSlide = 0;
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
let products = [];
let currentQuantity = 1; // Variabel untuk menyimpan quantity

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();

  initSlider();

  initEventListeners();

  updateCartCount();
});

// Fetch products from JSON
function fetchProducts() {
  fetch("/data/product.json")
    .then((response) => response.json())
    .then((data) => {
      products = data;
      displayDiscountProducts();
      displayNewProducts();
      displayAllProducts();
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
}

// Initialize event listeners
function initEventListeners() {
  hamburger.addEventListener("click", toggleMobileMenu);

  searchInput.addEventListener("input", handleSearch);

  closeModal.addEventListener("click", () => {
    productModal.classList.remove("show");
  });

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) {
      productModal.classList.remove("show");
    }
  });

  // Toggle search input on mobile
  searchIcon.addEventListener("click", () => {
    searchInput.classList.toggle("active");
    if (searchInput.classList.contains("active")) {
      searchInput.focus();
    }
  });

  navLinks.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });

  // Category tabs
  categoryTabs.addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-btn")) {
      // Remove active class from all buttons
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      e.target.classList.add("active");

      const category = e.target.dataset.category;
      filterProductsByCategory(category);
    }
  });

  // Newsletter form
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector("input").value;
    showNotification("Thank you for subscribing!");
    newsletterForm.reset();
  });
}

// Initialize slider
function initSlider() {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  // Auto slide change
  setInterval(() => {
    changeSlide(1);
  }, 5000);

  // Dot click events
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      updateSlider();
    });
  });
}

// Change slide
function changeSlide(direction) {
  const slides = document.querySelectorAll(".slide");
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  updateSlider();
}

// Update slider display
function updateSlider() {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentSlide);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}

// Toggle mobile menu
function toggleMobileMenu() {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("active");
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    document.removeEventListener("wheel", preventScroll);
    document.removeEventListener("touchmove", preventScroll);
  });
});

// Handle search
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();

  if (searchTerm.length > 2) {
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displaySearchResults(filteredProducts);
  } else if (searchTerm.length === 0) {
    displayAllProducts();
  }
}

// Display search results
function displaySearchResults(filteredProducts) {
  categoryProducts.innerHTML = "";

  if (filteredProducts.length === 0) {
    categoryProducts.innerHTML = '<p class="no-results">No products found</p>';
    return;
  }

  filteredProducts.forEach((product) => {
    categoryProducts.appendChild(createProductCard(product));
  });
}

// Display discount products
function displayDiscountProducts() {
  const discountedProducts = products.filter(
    (product) => product.discountedPrice
  );

  // Sort by discount percentage (highest first)
  discountedProducts.sort((a, b) => {
    const discountA = ((a.price - a.discountedPrice) / a.price) * 100;
    const discountB = ((b.price - b.discountedPrice) / b.price) * 100;
    return discountB - discountA;
  });

  discountedProducts.slice(0, 8).forEach((product) => {
    discountProducts.appendChild(createProductCard(product));
  });
}

// Display new products
function displayNewProducts() {
  products.slice(0, 8).forEach((product) => {
    newProducts.appendChild(createProductCard(product));
  });
}

// Display all products
function displayAllProducts() {
  categoryProducts.innerHTML = "";
  products.slice(0, 12).forEach((product) => {
    categoryProducts.appendChild(createProductCard(product));
  });
}

// Filter products by category
function filterProductsByCategory(Section) {
  categoryProducts.innerHTML = "";

  if (Section === "all") {
    displayAllProducts();
    return;
  }

  const filteredProducts = products
    .filter((product) => product.Section === Section)
    .slice(0, 12);

  if (filteredProducts.length === 0) {
    categoryProducts.innerHTML =
      '<p class="no-results">No products in this category</p>';
    return;
  }

  filteredProducts.forEach((product) => {
    categoryProducts.appendChild(createProductCard(product));
  });
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.id = product.id;

  const discountPercentage = product.discountedPrice
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100
      )
    : 0;

  const formattedPrice = formatPrice(product.price);
  const formattedDiscountedPrice = product.discountedPrice
    ? formatPrice(product.discountedPrice)
    : null;

  card.innerHTML = `
        ${
          discountPercentage > 0
            ? `<div class="product-badge">${discountPercentage}% OFF</div>`
            : ""
        }
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-overlay"></div>
        </div>
        <div class="product-details">
            <h3>${product.name}</h3>
            <div class="price">
                ${
                  product.discountedPrice
                    ? `<span class="current-price">${formattedDiscountedPrice}</span>
                       <span class="original-price">${formattedPrice}</span>`
                    : `<span class="current-price">${formattedPrice}</span>`
                }
            </div>
            <div class="product-meta">
                <div class="rating">
                    ${createRatingStars(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
            </div>
        </div>
    `;

  // Add click event to show product modal
  card.addEventListener("click", () => {
    showProductModal(product);
  });

  return card;
}

// Create rating stars
function createRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }

  return stars;
}

// Format price with IDR currency
function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function showProductModal(product) {
  modalBody.innerHTML = createModalContent(product);
  productModal.classList.add("show");

  initModalInteractions(product);
}

// Create modal content
function createModalContent(product) {
  const discountPercentage = product.discountedPrice
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100
      )
    : 0;

  const formattedPrice = formatPrice(product.price);
  const formattedDiscountedPrice = product.discountedPrice
    ? formatPrice(product.discountedPrice)
    : null;

  // Create color options
  let colorOptions = "";
  Object.entries(product.images).forEach(([color, imageUrl]) => {
    colorOptions += `
            <div class="color-option" data-color="${color}" data-image="${imageUrl}">
                <div class="color-swatch" style="background-color: ${getColorHex(
                  color
                )}"></div>
                <span>${color}</span>
            </div>
        `;
  });

  // Create size options
  let sizeOptions = "";
  product.sizes.forEach((size) => {
    sizeOptions += `
            <button class="size-btn" data-size="${size}">${size}</button>
        `;
  });

  return `
        <div class="modal-image">
            <img src="${product.image}" alt="${
    product.name
  }" id="modalProductImage">
            <button class="wishlist-btn">
                <i class="far fa-heart"></i>
            </button>
        </div>
        <div class="modal-details">
            <h2>${product.name}</h2>
            <div class="price">
                ${
                  product.discountedPrice
                    ? `<span class="current-price">${formattedDiscountedPrice}</span>
                       <span class="original-price">${formattedPrice}</span>
                       <span class="discount">${discountPercentage}% OFF</span>`
                    : `<span class="current-price">${formattedPrice}</span>`
                }
            </div>
            <div class="rating">
                ${createRatingStars(product.rating)}
                <span>${product.rating} (${product.reviews} reviews)</span>
            </div>
            <div class="description">
                <p>${product.description}</p>
                <p><strong>Material:</strong> ${product.material}</p>
            </div>
            
            <div class="color-selector">
                <label>Color:</label>
                <div class="colors">
                    ${colorOptions}
                </div>
            </div>
            
            <div class="size-selector">
                <label>Size:</label>
                <div class="sizes">
                    ${sizeOptions}
                </div>
            </div>
            
            <div class="quantity-selector">
                <label>Quantity:</label>
                <div class="quantity-control">
                    <button class="decrement">-</button>
                    <span class="quantity">1</span>
                    <button class="increment">+</button>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="add-to-cart">Add to Cart</button>
                <button class="buy-now">Buy Now</button>
            </div>
        </div>
    `;
}

// Initialize modal interactions
function initModalInteractions(product) {
  // Reset quantity
  currentQuantity = 1;

  // Color selection
  const colorOptions = document.querySelectorAll(".color-option");
  const modalProductImage = document.getElementById("modalProductImage");
  const wishlistBtn = document.querySelector(".wishlist-btn");

  // Wishlist button
  wishlistBtn.addEventListener("click", () => {
    wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
    showNotification(`${product.name} added to wishlist`);
  });

  // Color options
  colorOptions.forEach((option) => {
    option.addEventListener("click", () => {
      colorOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      modalProductImage.src = option.dataset.image;
    });
  });

  // Set first color as active by default
  if (colorOptions.length > 0) {
    colorOptions[0].classList.add("active");
  }

  // Size selection
  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sizeButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });

  // Set first size as active by default
  if (sizeButtons.length > 0) {
    sizeButtons[0].classList.add("active");
  }

  // Quantity control
  const decrementBtn = document.querySelector(".decrement");
  const incrementBtn = document.querySelector(".increment");
  const quantityDisplay = document.querySelector(".quantity");

  decrementBtn.addEventListener("click", () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      quantityDisplay.textContent = currentQuantity;
    }
  });

  incrementBtn.addEventListener("click", () => {
    currentQuantity++;
    quantityDisplay.textContent = currentQuantity;
  });

  // Add to cart button
  const addToCartBtn = document.querySelector(".add-to-cart");
  addToCartBtn.addEventListener("click", () => {
    const selectedSize =
      document.querySelector(".size-btn.active")?.dataset.size ||
      product.sizes[0];
    const selectedColor =
      document.querySelector(".color-option.active")?.dataset.color ||
      Object.keys(product.images)[0];

    addToCart(product.id, currentQuantity, selectedSize, selectedColor);
    productModal.classList.remove("show");
  });

  // Buy now button
  const buyNowBtn = document.querySelector(".buy-now");
  buyNowBtn.addEventListener("click", () => {
    const selectedSize =
      document.querySelector(".size-btn.active")?.dataset.size ||
      product.sizes[0];
    const selectedColor =
      document.querySelector(".color-option.active")?.dataset.color ||
      Object.keys(product.images)[0];

    addToCart(product.id, currentQuantity, selectedSize, selectedColor);
    productModal.classList.remove("show");
    window.location.href = "cart.html";
  });
}

// Get color hex code
function getColorHex(colorName) {
  const colorMap = {
    Black: "#000000",
    Charcoal: "#36454F",
    Camel: "#C19A6B",
    Navy: "#000080",
    Burgundy: "#800020",
    Ivory: "#FFFFF0",
    White: "#FFFFFF",
    Gray: "#808080",
    Brown: "#A52A2A",
    "Dark Green": "#006400",
    Slate: "#708090",
    Maroon: "#800000",
    "Heather Gray": "#9E9E9E",
    Beige: "#F5F5DC",
    "Light Blue": "#ADD8E6",
    Olive: "#808000",
    Ecru: "#C2B280",
    "Dusty Pink": "#D4B8B8",
    "Sage Green": "#B2AC88",
    Natural: "#F5F5DC",
    Taupe: "#483C32",
    Red: "#FF0000",
    Cream: "#FFFDD0",
    Tan: "#D2B48C",
    Khaki: "#C3B091",
    Herringbone: "#6B6B6B",
    "Brown Check": "#8B4513",
    "Rose Gold": "#B76E79",
    Striped: "linear-gradient(45deg, #000000 50%, #FFFFFF 50%)",
  };

  return colorMap[colorName] || "#CCCCCC";
}

// Add to cart function
function addToCart(productId, quantity, size = "", color = "") {
  const product = products.find((p) => p.id === productId);

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  // Check if item already exists in cart
  const existingItemIndex = cartItems.findIndex(
    (item) =>
      item.id === productId && item.size === size && item.color === color
  );

  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cartItems.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.discountedPrice || product.price,
      originalPrice: product.discountedPrice ? product.price : null,
      quantity,
      size,
      color,
    });
  }

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cartItems));

  // Update cart count
  updateCartCount();

  // Show notification
  showNotification(`${product.name} added to cart`);
}

// Update cart count
function updateCartCount() {
  cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  if (count > 0) {
    cartCount.textContent = count;
    cartCount.style.display = "flex";
  } else {
    cartCount.style.display = "none";
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
