export function renderProducts(productsData, container) {
  if (!container) return;
  
  const products = Array.isArray(productsData) ? productsData : (productsData?.products || productsData?.data || []);

  if (!products || products.length === 0) {
    container.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1;">Nenhum produto disponível no momento.</p>';
    return;
  }

  const fallbackImage = 'https://placehold.co/400x500/181818/ffffff?text=Rio+Groove';

  const productsHTML = products.map(product => {
    let allImages = [];
    if (product.image_url) {
      allImages = [product.image_url];
    }
    const mainImage = allImages.length > 0 ? allImages[0] : fallbackImage;
    
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                            .format(product.price || 0)
                            .replace(/\s/, ' '); // ex: R$ 129,90

    // Tratamento de cores
    let colors = 'Padrão';
    if (Array.isArray(product.colors)) {
        colors = product.colors.join(', ');
    } else if (typeof product.colors === 'string') {
        colors = product.colors;
    }

    // Tratamento de thumbnails
    let thumbnailsHTML = '';
    if (allImages.length > 1) {
        thumbnailsHTML = allImages.map((url, idx) => `<img src="${url}" alt="Thumb" class="${idx === 0 ? 'is-active' : ''}">`).join('');
    } else if (allImages.length === 1) {
        thumbnailsHTML = `<img src="${mainImage}" alt="Thumb" class="is-active">`;
    }
    
    return `
      <div class="product-card" data-name="${product.name}" data-price="${product.price}" data-image="${mainImage}" data-colors="${colors}" data-slug="${product.slug}" style="cursor: pointer;">
        <a href="/product/${product.slug}" class="product-image-wrapper" style="display: block;">
          <img src="${mainImage}" alt="${product.name}" class="product-main-img" onerror="this.src='${fallbackImage}'">
        </a>
        <div class="product-thumbnails">
          ${thumbnailsHTML}
        </div>
        <div class="product-info">
          <h3 class="product-title heading-md"><a href="/product/${product.slug}">${product.name}</a></h3>
          <p class="product-price">${priceFormatted}</p>
          <div class="product-variants">
            <span class="variant-label">Cores Disponíveis: ${colors}</span>
            <span class="variant-label" style="margin-top: 1rem">Tamanho</span>
            <div class="size-selector">
              <div class="size-box" data-size="P">P</div>
              <div class="size-box" data-size="M">M</div>
              <div class="size-box" data-size="G">G</div>
              <div class="size-box" data-size="GG">GG</div>
              <div class="size-box" data-size="XGG">XGG</div>
            </div>
          </div>
          <div class="quantity-row">
            <span class="variant-label">Quantidade</span>
            <input type="number" class="quantity-input" min="1" value="1">
          </div>
          <p class="product-feedback" aria-live="polite"></p>
          <button type="button" class="btn" style="width: 100%">Adicionar ao carrinho</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = productsHTML;

  // Re-atrelar eventos de galeria e carrinho para os novos cards dinâmicos
  const newCards = container.querySelectorAll('.product-card');
  
  newCards.forEach(card => {
    if (typeof window.setupProductGallery === 'function') {
      window.setupProductGallery(card);
    }
    
    // Navegação ao clicar no card (exceto elementos interativos)
    card.addEventListener('click', (e) => {
      if (e.target.closest('button, .size-box, .product-thumbnails, input, a')) {
        return;
      }
      const slug = card.getAttribute('data-slug');
      if (slug) {
        // Usa o SPA router
        history.pushState(null, '', `/product/${slug}`);
        window.dispatchEvent(new CustomEvent('routechange', { detail: { path: `/product/${slug}` } }));
      }
    });
  });
}
