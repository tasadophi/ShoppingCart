// selectors
const productsContainer = document.querySelector(".products");
const cartModal = document.querySelector(".cart-modal");
const cartItems = document.querySelector(".cart-items");
const deleteCartBtn = document.querySelector(".delete-btn");
const confirmBtn = document.querySelector(".confirm");
const cartCount = document.querySelector(".cart-count");
const totalPrice = document.querySelector(".total-price");
const cartIcon = document.querySelector(".navbar__icon.cart");
const backdrop = document.querySelector(".backdrop");
let addToCartBtns = [];
let cart = [];

// imports
import { productsData } from "./products.js";

// classes
class Products {
  getProducts() {
    return productsData;
  }
}

class UI {
  displayProducts(products) {
    let productsHtml = "";
    products.forEach((product) => {
      const image = product.image;
      const title = product.title;
      const productId = product.id;
      const price = this.separatePrice(product.price);
      const productEl = `
      <div class="product">
        <div class="product__img-box">
          <img src=${image} alt="product" />
        </div>
        <div class="product__description">
          <span class="product__title">${title}</span>
          <span class="product__price">${price}</span>
          <div class="product__btn-box">
            <button class="btn product__btn" data-id=${productId}>
              افزودن به سبد خرید
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
      productsHtml += productEl;
    });
    productsContainer.innerHTML = productsHtml;
    addToCartBtns = [...document.querySelectorAll(".product__btn")];
    addToCartBtns.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        this.addToCart(event.currentTarget);
      });
    });
    this.loadCart();
  }

  loadCart() {
    let cart = [...Storage.getCart()];
    cart.forEach((cartItem) => {
      this.createCartItem(cartItem);
    });
    if (cart.length === 0) totalPrice.innerHTML = "سبد خرید شما خالی است";
  }

  setCartValue(cart) {
    let totalItems = 0;
    let price = cart.reduce((acc, curr) => {
      totalItems += curr.count;
      return acc + curr.count * curr.price;
    }, 0);
    cartCount.innerText = totalItems;
    if (price) {
      price = this.separatePrice(price);
      totalPrice.innerText = `مجموع: ${price} تومن`;
      return;
    }
    totalPrice.innerHTML = "سبد خرید شما خالی است";
  }

  deleteCart() {
    addToCartBtns.forEach((btn) => this.changeAddBtnMode(false, btn));
    cart = [];
    cartItems.innerHTML = "";
    Storage.saveCart(cart);
    this.setCartValue(cart);
    closeModal();
  }

  checkIcon(event) {
    if (event.target.classList.contains("fa-trash-alt")) {
      this.removeFromCart(event.target);
    } else if (event.target.classList.contains("fa-chevron-up")) {
      this.increaseCount(event.target.dataset.id);
    } else if (event.target.classList.contains("fa-chevron-down")) {
      this.decreaseCount(event.target.dataset.id);
    }
  }

  createCartItem(cartItem) {
    const image = cartItem.image;
    const title = cartItem.title;
    const price = this.separatePrice(cartItem.price);
    const id = cartItem.id;
    const count = cartItem.count;
    const productDiv = document.createElement("div");
    const btn = document.querySelector(`.product__btn[data-id="${id}"]`);
    productDiv.classList.add("cart-item");
    const productEl = `
        <div class="cart__img-box">
          <img src=${image} alt="" />
        </div>
        <div class="cart__description">
          <span class="cart__title">${title}</span>
          <span class="cart__price">${price}</span>
        </div>
        <div class="cart__incr-decr">
          <div class="cart__icon">
            <i class="fas fa-chevron-up" data-id=${id}></i>
          </div>
          <span class="count" data-id=${id}>${count}</span>
          <div class="cart__icon">
            <i class="fas fa-chevron-down" data-id=${id}></i>
          </div>
        </div>
        <div class="cart__icon">
          <i class="fas fa-trash-alt" data-id=${id}></i>
        </div>
    `;
    productDiv.innerHTML = productEl;
    cart = [...cart, { ...cartItem }];
    cartItems.appendChild(productDiv);
    Storage.saveCart(cart);
    this.setCartValue(cart);
    this.changeAddBtnMode(true, btn);
    const cartIcons = document.querySelectorAll(
      `.cart-item .cart__icon *[data-id="${cartItem.id}"]`
    );
    cartIcons.forEach((icon) =>
      icon.addEventListener("click", (e) => this.checkIcon(e))
    );
  }

  addToCart(btn) {
    const products = Storage.getProducts();
    const id = btn.dataset.id;
    const product = products.find((product) => product.id === parseInt(id));
    product.count = 1;
    this.createCartItem(product);
  }

  removeFromCart(item) {
    cart = Storage.getCart();
    cart = cart.filter((cartItem) => cartItem.id !== parseInt(item.dataset.id));
    item.parentElement.parentElement.remove();
    const btn = document.querySelector(
      `.product__btn[data-id="${item.dataset.id}"]`
    );
    this.changeAddBtnMode(false, btn);
    Storage.saveCart(cart);
    this.setCartValue(cart);
  }

  increaseCount(id) {
    cart = Storage.getCart();
    cart.map((item) => {
      if (item.id === parseInt(id)) {
        item.count++;
        document.querySelector(`.count[data-id="${id}"]`).innerText =
          item.count;
      }
    });
    Storage.saveCart(cart);
    this.setCartValue(cart);
  }

  decreaseCount(id) {
    cart = Storage.getCart();
    cart.map((item) => {
      if (item.id === parseInt(id)) {
        if (item.count > 1) item.count--;
        document.querySelector(`.count[data-id="${id}"]`).innerText =
          item.count;
      }
    });
    Storage.saveCart(cart);
    this.setCartValue(cart);
  }

  changeAddBtnMode(inCart, btn) {
    if (inCart) {
      btn.innerText = "در سبد خرید";
      btn.disabled = true;
      return;
    }
    btn.innerHTML = `افزودن به سبد خرید<i class="fas fa-cart-plus"></i>`;
    btn.disabled = false;
  }

  separatePrice(number) {
    number += "";
    number = number.replace(",", "");
    let x = number.split(".");
    let y = x[0];
    let z = x.length > 1 ? "." + x[1] : "";
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(y)) y = y.replace(rgx, "$1" + "٫" + "$2");
    return y + z;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts() {
    return JSON.parse(localStorage.getItem("products"));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
}
// events

const closeModal = () => {
  cartModal.classList.remove("show");
};
document.addEventListener("DOMContentLoaded", () => {
  let products = new Products();
  products = products.getProducts();
  const ui = new UI();
  cartIcon.addEventListener("click", () => cartModal.classList.add("show"));
  backdrop.addEventListener("click", closeModal);
  confirmBtn.addEventListener("click", closeModal);
  ui.displayProducts(products);
  Storage.saveProducts(products);
  deleteCartBtn.addEventListener("click", () => ui.deleteCart());
});
