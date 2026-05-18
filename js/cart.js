// Este arquivo prepara a estrutura de carrinho modularizada.
// A lógica será evoluída incrementalmente conforme o plano.
// Atualmente a lógica de "Adicionar ao Carrinho" da página
// individual e os cálculos residem na própria página e no index.html.

export const CART_STORAGE_KEY = 'rioGrooveCart';

export function getCart() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (e) {
    console.warn('Erro ao ler carrinho', e);
    return [];
  }
}

export function saveCart(cart) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateFloatingCartCount();
  } catch (e) {
    console.warn('Erro ao salvar no carrinho', e);
  }
}

export function initFloatingCart() {
  if (document.getElementById('floating-cart-btn')) return;

  // CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .floating-cart-btn {
      display: none;
      position: fixed;
      bottom: 2rem;
      right: 1.5rem;
      width: 56px;
      height: 56px;
      background: rgba(10, 10, 10, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      z-index: 1000;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(232, 37, 26, 0.15);
      backdrop-filter: blur(12px);
      color: white;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .floating-cart-btn svg {
      width: 24px;
      height: 24px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.5;
    }
    @media (max-width: 768px) {
      .floating-cart-btn {
        display: flex;
      }
    }
    .floating-cart-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(232, 37, 26, 0.25);
      border-color: rgba(232, 37, 26, 0.4);
    }
    .floating-cart-count {
      position: absolute;
      top: -2px;
      right: -2px;
      background: var(--rg-red, #e8251a);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid var(--bg-base, #050505);
      font-family: var(--font-body, 'Inter', sans-serif);
    }
    .cart-popup {
      display: none;
      position: fixed;
      bottom: -100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 15, 15, 0.95);
      border: 1px solid rgba(232, 37, 26, 0.3);
      padding: 1rem 1.5rem;
      border-radius: 999px;
      color: white;
      font-family: var(--font-heading, 'Oswald', sans-serif);
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      align-items: center;
      gap: 0.75rem;
      z-index: 1001;
      box-shadow: 0 10px 40px rgba(232, 37, 26, 0.2);
      backdrop-filter: blur(12px);
      transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
      opacity: 0;
      pointer-events: none;
      white-space: nowrap;
    }
    @media (max-width: 768px) {
      .cart-popup {
        display: flex;
      }
      .cart-popup.show {
        bottom: 6.5rem;
        opacity: 1;
      }
    }
    .cart-popup svg {
      width: 20px;
      height: 20px;
      stroke: var(--rg-red, #e8251a);
      fill: none;
      stroke-width: 2;
    }
  `;
  document.head.appendChild(style);

  // Floating Button HTML
  const btn = document.createElement('a');
  btn.href = 'index.html#carrinho';
  btn.className = 'floating-cart-btn';
  btn.id = 'floating-cart-btn';
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
    <span class="floating-cart-count" id="floating-cart-count">0</span>
  `;
  
  btn.addEventListener('click', (e) => {
    const isIndexHtml = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('rio-groove-cloudflare-final-corrigido/');
    if (isIndexHtml) {
      const cartLink = document.querySelector('a[href="#carrinho"]');
      if (cartLink) {
        e.preventDefault();
        cartLink.click();
      }
    }
  });

  document.body.appendChild(btn);

  // Popup HTML
  const popup = document.createElement('div');
  popup.className = 'cart-popup';
  popup.id = 'cart-popup';
  popup.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6L9 17l-5-5"></path>
    </svg>
    <span id="cart-popup-text">Item adicionado</span>
  `;
  document.body.appendChild(popup);

  updateFloatingCartCount();
}

export function updateFloatingCartCount() {
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const countEl = document.getElementById('floating-cart-count');
  
  if (countEl) {
    countEl.textContent = count;
  }
  
  const headerCartBtn = document.querySelector('.header-nav-cart');
  if (headerCartBtn) {
    headerCartBtn.innerHTML = `CARRINHO (${count})`;
  }
}

window.updateFloatingCartCount = updateFloatingCartCount;

let popupTimeout;
export function showCartPopup() {
  const popup = document.getElementById('cart-popup');
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const textEl = document.getElementById('cart-popup-text');
  
  if (popup && textEl) {
    textEl.textContent = `${count} item${count !== 1 ? 's' : ''} no carrinho`;
    
    popup.classList.add('show');
    
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
      popup.classList.remove('show');
    }, 3000);
  }
}

window.showCartPopup = showCartPopup;
