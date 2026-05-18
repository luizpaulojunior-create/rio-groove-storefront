import { fetchActiveProducts, fetchCollections, getProductBySlug, fetchCollectionBySlug } from './products.js';
import { renderProducts } from './renderProducts.js';
import { initFloatingCart } from './cart.js';

let isCollectionsLoaded = false;
let isProductsLoaded = false;

// Inicialização do SPA
// Como este script é type="module", o DOM já está analisado neste ponto
initFloatingCart();
handleCurrentRoute(window.location.pathname);

window.addEventListener('routechange', (e) => {
  handleCurrentRoute(e.detail.path);
});

async function handleCurrentRoute(path) {
  const cleanPath = path.replace(/\/$/, '') || '/';
  
  const promises = [];
  
  if (cleanPath === '/' || cleanPath === '/collections') {
    promises.push(loadCollections());
  }
  
  if (cleanPath === '/' || cleanPath === '/products') {
    promises.push(loadProducts());
  }
  
  if (cleanPath.startsWith('/product/')) {
    const slug = cleanPath.split('/').pop();
    promises.push(loadProductDetail(slug));
  }
  
  if (cleanPath.startsWith('/collection/')) {
    const slug = cleanPath.split('/').pop();
    promises.push(loadCollectionDetail(slug));
  }
  
  await Promise.all(promises);
}

async function loadCollections() {
  if (isCollectionsLoaded) return;
  const container = document.getElementById('collections-container');
  if (!container) return;
  
  const grid = container.querySelector('.collection-grid') || container;
  grid.innerHTML = '<p class="text-muted">Carregando coleções...</p>';
  
  const data = await fetchCollections();
  const collections = Array.isArray(data) ? data : (data.collections || data.data || []);
  
  if (!collections || collections.length === 0) {
    grid.innerHTML = '<p class="text-muted">Nenhuma coleção encontrada.</p>';
    return;
  }

  const html = collections.map(col => {
    const imageUrl = col.banner_url || col.image_url || 'https://placehold.co/400x460/181818/ffffff?text=Rio+Groove';
    return `
      <a href="/collection/${col.slug}" class="collection-card">
        <div class="collection-card-preview">
          <img src="${imageUrl}" alt="${col.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://placehold.co/400x460/181818/ffffff?text=Rio+Groove'" />
        </div>
        <h3 class="heading-sm">${col.name}</h3>
        <p class="text-sm text-muted">${col.description ? col.description.substring(0, 60) + '...' : ''}</p>
      </a>
    `;
  }).join('');

  grid.innerHTML = `<div class="collection-grid">${html}</div>`;
  isCollectionsLoaded = true;

  // SPA navigation for collection cards
  const newCards = grid.querySelectorAll('.collection-card');
  newCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const href = card.getAttribute('href');
      history.pushState(null, '', href);
      window.dispatchEvent(new CustomEvent('routechange', { detail: { path: href } }));
    });
  });
}

async function loadProducts() {
  if (isProductsLoaded) return;
  
  const grids = document.querySelectorAll('#products-grid');
  if (!grids.length) return;
  
  grids.forEach(grid => {
    grid.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1;">Carregando produtos...</p>';
  });
  
  const data = await fetchActiveProducts();
  const products = Array.isArray(data) ? data : (data.products || data.data || []);
  
  grids.forEach(grid => {
    renderProducts(products, grid);
  });
  
  isProductsLoaded = true;
}

async function loadProductDetail(slug) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-placeholder">Carregando detalhes do produto...</div>';
  
  const product = await getProductBySlug(slug);
  
  if (!product) {
    container.innerHTML = '<div class="error-placeholder"><h2 class="heading-lg">Produto não <span class="text-red">encontrado</span></h2><p>O produto que você está procurando não existe ou está indisponível.</p><a href="/products" class="btn btn-red" style="margin-top: 2rem;">Ver todos os produtos</a></div>';
    
    // Add router event listener to back button
    const backBtn = container.querySelector('a.btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '/products');
        window.dispatchEvent(new CustomEvent('routechange', { detail: { path: '/products' } }));
      });
    }
    return;
  }
  
  // Create an array with product just for the renderProducts to use
  // We'll wrap it in a special detail layout
  container.innerHTML = `
    <div class="product-detail-layout" style="max-width: 500px; margin: 0 auto;">
      <div id="single-product-grid" class="product-grid" style="grid-template-columns: 1fr;"></div>
    </div>
  `;
  
  const grid = document.getElementById('single-product-grid');
  renderProducts([product], grid);
}

async function loadCollectionDetail(slug) {
  const header = document.getElementById('collection-detail-header');
  const grid = document.getElementById('collection-products-grid');
  
  if (!header || !grid) return;
  
  header.innerHTML = '<p class="text-muted">Carregando detalhes da coleção...</p>';
  grid.innerHTML = '';
  
  const collection = await fetchCollectionBySlug(slug);
  
  if (!collection) {
    header.innerHTML = '<h2 class="heading-lg">Coleção não <span class="text-red">encontrada</span></h2>';
    return;
  }
  
  const imageUrl = collection.banner_url || collection.image_url || 'https://placehold.co/1200x400/181818/ffffff?text=Rio+Groove';
  
  header.innerHTML = `
    <div class="collection-cover">
      <img src="${imageUrl}" alt="Capa da coleção ${collection.name}">
      <span class="collection-cover-label">Coleção Oficial</span>
    </div>
    <h2 class="heading-lg">${collection.name}</h2>
    <p class="text-muted" style="margin-bottom: 4rem; max-width: 600px">${collection.description || ''}</p>
  `;
  
  if (!collection.products || collection.products.length === 0) {
    grid.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1;">Nenhum produto nesta coleção.</p>';
    return;
  }
  
  renderProducts(collection.products, grid);
}
