import { API_URL } from './api.js';

export async function getProductBySlug(slug) {
  try {
    const response = await fetch(`${API_URL}/products/${slug}?_t=${Date.now()}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data?.data || data;
  } catch (error) {
    console.error('Exceção ao buscar produto:', error);
    return null;
  }
}

export async function fetchActiveProducts() {
  try {
    const response = await fetch(`${API_URL}/products?active=true&_t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data.products || data.data || []);
  } catch (error) {
    console.error('Exceção ao buscar produtos:', error);
    return [];
  }
}

export async function fetchCollections() {
  try {
    const response = await fetch(`${API_URL}/collections?_t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data.collections || data.data || []);
  } catch (error) {
    console.error('Erro ao buscar coleções:', error);
    return [];
  }
}

export async function fetchCollectionBySlug(slug) {
  try {
    const response = await fetch(`${API_URL}/collections/${slug}?_t=${Date.now()}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data?.data || data;
  } catch (error) {
    console.error('Erro ao buscar coleção por slug:', error);
    return null;
  }
}
