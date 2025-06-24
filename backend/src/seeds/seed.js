import axios from 'axios';
import pkg from 'pg';
const { Client } = pkg;
import env from 'dotenv';

env.config();

async function runSeeder() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      'postgres://localhost:5432/dummyProject_db'
  });
  await client.connect();

  try {
    // 1) Fetch data
    const { data } = await axios.get('https://dummyjson.com/products');
    const products = data.products;

    for (const p of products) {
      let newProdId;

      // 2) Insert into products (omit dimensions)
      const prodInsertText = `
        INSERT INTO products (
          title, description, price, discount_percentage,
          rating, stock, minimum_order_quantity, brand, category,
          sku, weight,
          availability_status, warranty_information,
          shipping_information, return_policy
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9,
          $10, $11,
          $12, $13,
          $14, $15
        )
        RETURNING id;
      `;

      const prodValues = [
        p.title,
        p.description,
        p.price,
        p.discountPercentage,
        p.rating,
        p.stock,
        p.minimumOrderQuantity || 1,
        p.brand,
        p.category,
        // dummyjson doesn’t provide SKU for all products:
        p.sku || null,
        // weight if provided
        p.weight || null,
        p.availabilityStatus || null,
        p.warrantyInformation || null,
        p.shippingInformation || null,
        p.returnPolicy || null
      ];

      try {
        const res = await client.query(prodInsertText, prodValues);
        newProdId = res.rows[0].id;
      } catch (err) {
        if (err.code === '23505') {
          // conflict on some unique (e.g. title), fall back to lookup
          const lookup = await client.query(
            `SELECT id FROM products WHERE title = $1`,
            [p.title]
          );
          newProdId = lookup.rows[0].id;
        } else {
          throw err;
        }
      }

      // 2b) Insert dimensions
      const { width, height, depth } = p.dimensions || {};
      if (width != null || height != null || depth != null) {
        await client.query(
          `
          INSERT INTO product_dimensions (
            product_id, width, height, depth
          ) VALUES ($1, $2, $3, $4)
          ON CONFLICT (product_id)
          DO UPDATE
            SET width = EXCLUDED.width,
                height = EXCLUDED.height,
                depth = EXCLUDED.depth;
          `,
          [newProdId, width, height, depth]
        );
      }

      // 3) Images (including thumbnail)
      if (p.thumbnail) {
        await client.query(
          `INSERT INTO product_images (product_id, url, is_thumbnail)
           VALUES ($1, $2, TRUE)
           ON CONFLICT DO NOTHING;`,
          [newProdId, p.thumbnail]
        );
      }
      if (Array.isArray(p.images)) {
        for (const url of p.images) {
          await client.query(
            `INSERT INTO product_images (product_id, url, is_thumbnail)
             VALUES ($1, $2, FALSE)
             ON CONFLICT DO NOTHING;`,
            [newProdId, url]
          );
        }
      }

      // 4) Tags & product_tags
      if (Array.isArray(p.tags)) {
        for (const tagName of p.tags) {
          const resTag = await client.query(
            `INSERT INTO tags (name)
             VALUES ($1)
             ON CONFLICT (name) DO UPDATE
               SET name = EXCLUDED.name
             RETURNING id;`,
            [tagName]
          );
          const tagId = resTag.rows[0].id;
          await client.query(
            `INSERT INTO product_tags (product_id, tag_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING;`,
            [newProdId, tagId]
          );
        }
      }

      // 5) Reviews
      if (Array.isArray(p.reviews)) {
        for (const rev of p.reviews) {
          await client.query(
            `INSERT INTO reviews (
               product_id, rating, comment,
               reviewer_name, reviewer_email, review_date
             ) VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING;`,
            [
              newProdId,
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
          `INSERT INTO product_meta (
             product_id, created_at, updated_at, barcode, qr_code
           ) VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (product_id) DO NOTHING;`,
          [
            newProdId,
            p.meta.createdAt ? new Date(p.meta.createdAt) : null,
            p.meta.updatedAt ? new Date(p.meta.updatedAt) : null,
            p.meta.barcode || null,
            p.meta.qrCode || null
          ]
        );
      }
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.end();
  }
}

runSeeder();
