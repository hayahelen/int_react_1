import axios from 'axios';
import pkg from 'pg';
const { Client } = pkg;
import env from 'dotenv';

env.config();

async function runSeeder() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/dummyProject_db'
  });
  await client.connect();

  try {
    // 1) Fetch data
    const { data } = await axios.get('https://dummyjson.com/products');
    const products = data.products;

    for (const p of products) {
      // 2) Insert into products (explicitly set id to match API)
      const prodInsertText = `
        INSERT INTO products(
          id, title, description, price, discount_percentage,
          rating, stock, minimum_order_quantity, brand, category,
          sku, weight, width, height, depth,
          availability_status, warranty_information,
          shipping_information, return_policy
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18, $19
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      await client.query(prodInsertText, [
        p.id, p.title, p.description, p.price, p.discountPercentage,
        p.rating, p.stock, p.minimumOrderQuantity || 1, p.brand, p.category,
        p.sku || null, p.weight || null,
        p.dimensions?.width || null,
        p.dimensions?.height || null,
        p.dimensions?.depth || null,
        p.availabilityStatus || null,
        p.warrantyInformation || null,
        p.shippingInformation || null,
        p.returnPolicy || null
      ]);

      // 3) Images (including thumbnail)
      if (p.thumbnail) {
        await client.query(
          `INSERT INTO product_images(product_id, url, is_thumbnail)
           VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING;`,
          [p.id, p.thumbnail]
        );
      }
      if (Array.isArray(p.images)) {
        for (const url of p.images) {
          await client.query(
            `INSERT INTO product_images(product_id, url, is_thumbnail)
             VALUES ($1, $2, FALSE) ON CONFLICT DO NOTHING;`,
            [p.id, url]
          );
        }
      }

      // 4) Tags & product_tags
      if (Array.isArray(p.tags)) {
        for (const tagName of p.tags) {
          // ensure tag exists
          const resTag = await client.query(
            `INSERT INTO tags(name) VALUES($1)
             ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name
             RETURNING id;`,
            [tagName]
          );
          const tagId = resTag.rows[0].id;
          // link
          await client.query(
            `INSERT INTO product_tags(product_id, tag_id)
             VALUES($1, $2) ON CONFLICT DO NOTHING;`,
            [p.id, tagId]
          );
        }
      }

      // 5) Reviews
      if (Array.isArray(p.reviews)) {
        for (const rev of p.reviews) {
          await client.query(
            `INSERT INTO reviews(
               product_id, rating, comment,
               reviewer_name, reviewer_email, review_date
             ) VALUES($1,$2,$3,$4,$5,$6)
             ON CONFLICT DO NOTHING;`,
            [
              p.id,
              rev.rating || null,
              rev.comment || null,
              rev.reviewerName || null,
              rev.reviewerEmail || null,
              rev.date ? new Date(rev.date) : null
            ]
          );
        }
      }

      // 6) Meta
      if (p.meta) {
        await client.query(
          `INSERT INTO product_meta(
             product_id, created_at, updated_at, barcode, qr_code
           ) VALUES($1,$2,$3,$4,$5)
           ON CONFLICT (product_id) DO NOTHING;`,
          [
            p.id,
            p.meta.createdAt ? new Date(p.meta.createdAt) : null,
            p.meta.updatedAt ? new Date(p.meta.updatedAt) : null,
            p.meta.barcode || null,
            p.meta.qrCode || null
          ]
        );
      }
    }

    console.log('✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await client.end();
  }
}


runSeeder();