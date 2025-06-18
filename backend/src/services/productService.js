import {query} from '../db.js'


export const getAllProducts = async () => {
  const result = await query('SELECT * FROM products');
  return result.rows;
};

export const getProductDetails = async (productId) => {
  const product = await query('SELECT * FROM products WHERE id = $1', [productId]);

  const { rows: imgRows } = await query(
    'SELECT url, is_thumbnail FROM product_images WHERE product_id=$1',
    [productId]
    );
    const images = imgRows.map(r => r.url);           // array of URLs
    const thumbnail = imgRows.find(r => r.is_thumbnail)?.url;

  const reviews = await query('SELECT * FROM reviews WHERE product_id = $1', [productId]);

  return {
    ...product.rows[0],
    images,
    thumbnail,
    reviews: reviews.rows,
  };
};

export const searchProducts = async (q) => {
  const sql = `
    SELECT * FROM products
    WHERE title ILIKE $1
       OR description ILIKE $1
  `;
  const { rows } = await query(sql, [`%${q}%`]);
  return rows;
};