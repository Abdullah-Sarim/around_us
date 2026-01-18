import { db } from "./index";
import { eq, sql } from "drizzle-orm";
import {
  users,
  comments,
  products,
  conversations,
  messages,
  type NewUser,
  type NewComment,
  type NewProduct,
  type NewConversation,
  type NewMessage,
} from "./schema";

// USER QUERIES
export const createUser = async (data: NewUser) => {
  const [user] = await db.insert(users).values(data).returning();
  return user;
};

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const updateUser = async (id: string, data: Partial<NewUser>) => {
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new Error(`User with id ${id} not found`);
  }

  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return user;
};

// upsert => create or update

export const upsertUser = async (data: NewUser) => {
  const [user] = await db
    .insert(users)
    .values({
      id: data.id,
      email: data.email,
      name: data.name,
      imageUrl: data.imageUrl,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: data.email,
        name: data.name,
        imageUrl: data.imageUrl,
      },
    })
    .returning();

  return user;
};

// PRODUCT QUERIES
// export const createProduct = async (data: NewProduct) => {
//   const [product] = await db.insert(products).values(data).returning();
//   return product;
// };

export const createProduct = async (data: NewProduct) => {
  const user = await getUserById(data.userId);

  if (!user?.city) {
    throw new Error("User city not set");
  }

  const [product] = await db
    .insert(products)
    .values({
      ...data,
      city: user.city.toLowerCase(),
    })
    .returning();

  return product;
};

// Added to get product by city with pagination

export const getProductsByCity = async (city: string, page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  const cityLower = city.toLowerCase();
  
  const result = await db.execute(
    sql`SELECT p.id, p.title, p.description, p.image_url, p.price, p.is_negotiable, p.is_sold, p.sold_at, p.city, p.user_id, p.created_at, p.updated_at,
     json_build_object('id', u.id, 'email', u.email, 'name', u.name, 'imageUrl', u.image_url, 'city', u.city, 'created_at', u.created_at, 'updated_at', u.updated_at) as user
     FROM products p 
     LEFT JOIN users u ON p.user_id = u.id 
     WHERE p.city = ${cityLower}
     ORDER BY p.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`
  );
  
  const countResult = await db.execute(
    sql`SELECT COUNT(*) as total FROM products WHERE city = ${cityLower}`
  );
  
  const products = result.rows.map((row: any) => {
    const product: any = {
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      price: row.price,
      city: row.city,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    if (row.is_negotiable !== undefined) product.isNegotiable = row.is_negotiable;
    if (row.is_sold !== undefined) product.isSold = row.is_sold;
    if (row.sold_at !== undefined) product.soldAt = row.sold_at;
    if (row.user) product.user = row.user;
    return product;
  });
  
  const total = Number(countResult.rows[0]?.total) || 0;
  
  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const searchProducts = async (query: string, page: number = 1, limit: number = 20) => {
  const searchTerm = `%${query.toLowerCase()}%`;
  const offset = (page - 1) * limit;
  
  const result = await db.execute(
    sql`SELECT p.id, p.title, p.description, p.image_url, p.price, p.is_negotiable, p.is_sold, p.sold_at, p.city, p.user_id, p.created_at, p.updated_at,
     json_build_object('id', u.id, 'email', u.email, 'name', u.name, 'imageUrl', u.image_url, 'city', u.city, 'created_at', u.created_at, 'updated_at', u.updated_at) as user
     FROM products p 
     LEFT JOIN users u ON p.user_id = u.id 
     WHERE LOWER(p.title) LIKE ${searchTerm} OR LOWER(p.description) LIKE ${searchTerm}
     ORDER BY p.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`
  );
  
  const countResult = await db.execute(
    sql`SELECT COUNT(*) as total FROM products WHERE LOWER(title) LIKE ${searchTerm} OR LOWER(description) LIKE ${searchTerm}`
  );
  
  const total = Number(countResult.rows[0]?.total) || 0;
  
  return {
    products: result.rows.map((row: any) => {
      const product: any = {
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.image_url,
        price: row.price,
        city: row.city,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      if (row.is_negotiable !== undefined) product.isNegotiable = row.is_negotiable;
      if (row.is_sold !== undefined) product.isSold = row.is_sold;
      if (row.sold_at !== undefined) product.soldAt = row.sold_at;
      if (row.user) product.user = row.user;
      return product;
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getAllProducts = async (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  
  const result = await db.execute(
    sql`SELECT p.id, p.title, p.description, p.image_url, p.price, p.is_negotiable, p.is_sold, p.sold_at, p.city, p.user_id, p.created_at, p.updated_at,
     json_build_object('id', u.id, 'email', u.email, 'name', u.name, 'imageUrl', u.image_url, 'city', u.city, 'created_at', u.created_at, 'updated_at', u.updated_at) as user
     FROM products p 
     LEFT JOIN users u ON p.user_id = u.id 
     ORDER BY p.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`
  );
  
  const countResult = await db.execute(sql`SELECT COUNT(*) as total FROM products`);
  
  const total = Number(countResult.rows[0]?.total) || 0;
  
  return {
    products: result.rows.map((row: any) => {
      const product: any = {
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.image_url,
        price: row.price,
        city: row.city,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      if (row.is_negotiable !== undefined) product.isNegotiable = row.is_negotiable;
      if (row.is_sold !== undefined) product.isSold = row.is_sold;
      if (row.sold_at !== undefined) product.soldAt = row.sold_at;
      if (row.user) product.user = row.user;
      return product;
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getProductById = async (id: string) => {
  const productResult = await db.execute(
    sql`SELECT p.id, p.title, p.description, p.image_url, p.price, p.is_negotiable, p.is_sold, p.sold_at, p.city, p.user_id, p.created_at, p.updated_at,
     json_build_object('id', u.id, 'email', u.email, 'name', u.name, 'imageUrl', u.image_url, 'city', u.city, 'created_at', u.created_at, 'updated_at', u.updated_at) as user
     FROM products p 
     LEFT JOIN users u ON p.user_id = u.id 
     WHERE p.id = ${id}`
  );
  
  if (productResult.rows.length === 0) return null;
  
  let row = productResult.rows[0];
  
  const commentsResult = await db.execute(
    sql`SELECT c.id, c.content, c.user_id, c.product_id, c.created_at,
     json_build_object('id', u.id, 'email', u.email, 'name', u.name, 'imageUrl', u.image_url) as user
     FROM comments c 
     LEFT JOIN users u ON c.user_id = u.id 
     WHERE c.product_id = ${id}
     ORDER BY c.created_at DESC`
  );
  
  const product: any = {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    price: row.price,
    city: row.city,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (row.is_negotiable !== undefined) product.isNegotiable = row.is_negotiable;
  if (row.is_sold !== undefined) product.isSold = row.is_sold;
  if (row.sold_at !== undefined) product.soldAt = row.sold_at;
  if (row.user) product.user = row.user;
  
  product.comments = commentsResult.rows.map((c: any) => {
    const comment: any = {
      id: c.id,
      content: c.content,
      userId: c.user_id,
      productId: c.product_id,
      createdAt: c.created_at,
    };
    if (c.user) comment.user = c.user;
    return comment;
  });
  
  return product;
};

export const getProductsByUserId = async (userId: string) => {
  return db.query.products.findMany({
    where: eq(products.userId, userId),
    with: { user: true },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
};

export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }

  const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
  return product;
};

export const deleteProduct = async (id: string) => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }

  const [product] = await db.delete(products).where(eq(products.id, id)).returning();
  return product;
};

// COMMENT QUERIES
export const createComment = async (data: NewComment) => {
  const [comment] = await db.insert(comments).values(data).returning();
  return comment;
};

export const deleteComment = async (id: string) => {
  const existingComment = await getCommentById(id);
  if (!existingComment) {
    throw new Error(`Comment with id ${id} not found`);
  }

  const [comment] = await db.delete(comments).where(eq(comments.id, id)).returning();
  return comment;
};

export const getCommentById = async (id: string) => {
  return db.query.comments.findFirst({
    where: eq(comments.id, id),
    with: { user: true },
  });
};

// CONVERSATION QUERIES
export const getOrCreateConversation = async (productId: string, buyerId: string, sellerId: string) => {
  // Check if conversation already exists for this product and buyer
  const existing = await db.query.conversations.findFirst({
    where: (conversations, { and, eq }) => and(
      eq(conversations.productId, productId),
      eq(conversations.buyerId, buyerId)
    ),
  });
  
  if (existing) return existing;

  // Create new conversation
  const [conversation] = await db.insert(conversations).values({
    productId,
    buyerId,
    sellerId,
  }).returning();
  
  return conversation;
};

export const getConversationsByUser = async (userId: string) => {
  return db.query.conversations.findMany({
    where: (conversations, { or, eq }) => or(
      eq(conversations.buyerId, userId),
      eq(conversations.sellerId, userId)
    ),
    with: {
      product: true,
      buyer: true,
      seller: true,
      messages: {
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit: 1,
      },
    },
    orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
  });
};

export const getConversationById = async (id: string) => {
  return db.query.conversations.findFirst({
    where: eq(conversations.id, id),
    with: {
      product: true,
      buyer: true,
      seller: true,
    },
  });
};

// MESSAGE QUERIES
export const createMessage = async (data: NewMessage) => {
  const [message] = await db.insert(messages).values(data).returning();
  return message;
};

export const getMessagesByConversation = async (conversationId: string) => {
  return db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    with: { sender: true },
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  await db.update(messages)
    .set({ isRead: "true" })
    .where(eq(messages.conversationId, conversationId));
};

export const deleteConversation = async (id: string) => {
  const [conversation] = await db.delete(conversations).where(eq(conversations.id, id)).returning();
  return conversation;
};
