import api from "./axios";

// USERS API
export const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/users/me");
    return data;
  } catch (error) {
    return { user: null };
  }
};

export const syncUser = async (userData) => {
  const { data } = await api.post("/users/sync", userData);
  return data;
};

export const updateUserCity = async (city) => {
  const { data } = await api.patch("/users/city", { city });
  return data;
};

// Products API
export const getAllProducts = async (page = 1, limit = 20) => {
  const { data } = await api.get(`/products?page=${page}&limit=${limit}`);
  return data;
};

export const getProductsByCity = async (city, page = 1, limit = 20) => {
  const { data } = await api.get(`/products/by-city?city=${city}&page=${page}&limit=${limit}`);
  return data;
};

export const searchProducts = async ({ query, page = 1, limit = 20 }) => {
  const { data } = await api.get(`/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await api.get("/products/my");
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data;
};

export const updateProduct = async ({ id, ...productData }) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// Comments API
export const createComment = async ({ productId, content }) => {
  const { data } = await api.post(`/comments/${productId}`, { content });
  return data;
};

export const deleteComment = async ({ commentId }) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};

// MESSAGES API
export const startConversation = async ({ productId, sellerId, buyerId }) => {
  const { data } = await api.post("/messages", { productId, sellerId, buyerId });
  return data;
};

export const getConversations = async () => {
  const { data } = await api.get("/messages");
  return data;
};

export const getConversation = async (id) => {
  const { data } = await api.get(`/messages/${id}`);
  return data;
};

export const getMessages = async (id) => {
  const { data } = await api.get(`/messages/${id}/messages`);
  return data;
};

export const sendMessage = async (id, content) => {
  const { data } = await api.post(`/messages/${id}`, { content });
  return data;
};

export const deleteConversation = async (id) => {
  const { data } = await api.delete(`/messages/${id}`);
  return data;
};

export const markAsSold = async (productId) => {
  const { data } = await api.post(`/products/sold/${productId}`);
  return data;
};

export const markAsUnsold = async (productId) => {
  const { data } = await api.delete(`/products/sold/${productId}`);
  return data;
};
