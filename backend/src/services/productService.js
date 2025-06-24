import {query} from '../db.js'


export const getAllProducts = async () => {
  const result = await query('SELECT * FROM products');
  return result.rows;
};




export const getProductDetails = async (productId) => {

        // COALESCE(array_agg(pi.url) FILTER (WHERE pi.url IS NOT NULL), '{}') AS images,

  //try here id and url
  const sql = `
  SELECT p.*,

  COALESCE(
    json_agg(
      json_build_object('id', pi.id, 'url', pi.url)
    ) FILTER (WHERE pi.id IS NOT NULL),
    '[]'
  ) AS images,

      MAX(pi.url) FILTER (WHERE pi.is_thumbnail) AS thumbnail,

	  coalesce(json_agg(
        json_build_object(
          'rating', r.rating,
          'comment', r.comment,
          'reviewer_name', r.reviewer_name,
          'reviewer_email', r.reviewer_email,
          'review_date', r.review_date
        ) 
		)FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews,

    json_build_object(
    'width', d.width,
    'height', d.height,
    'depth', d.depth) AS dimensions,

    json_build_object(
    'createdAt', m.created_at,
    'updatedAt', m.updated_at,
    'barcode', m.barcode,
    'qr_code', m.qr_code) AS meta,

    array_agg(DISTINCT t.name) AS tags

		FROM products p

    LEFT JOIN product_images pi
      ON pi.product_id = p.id

    LEFT JOIN reviews r
      ON r.product_id = p.id

      LEFT JOIN product_dimensions d
      ON d.product_id = p.id

    LEFT JOIN product_meta m
      ON m.product_id = p.id

     LEFT JOIN product_tags pt
      ON pt.product_id = p.id
    LEFT JOIN tags t
      ON t.id = pt.tag_id
      
    WHERE p.id = $1

    GROUP BY p.id,
      d.width, d.height, d.depth,
      m.created_at, m.updated_at, m.barcode, m.qr_code
    `;

  const { rows } = await query(sql, [productId]);


  return rows[0];
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


export const createProduct = async (productData) => {


  try {
  const {
    title, description, price, discount_percentage, rating,
    stock, minimum_order_quantity, brand, category, sku,
    weight, availability_status, warranty_information,
    shipping_information, return_policy, dimensions, images = [], tags = [], reviews = [], meta
  } = productData;



  const prodResult = await query(
    `INSERT INTO products (
      title, description, price, discount_percentage, rating,
      stock, minimum_order_quantity, brand, category, sku,
      weight, availability_status, warranty_information,
      shipping_information, return_policy
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14,
      $15
    ) RETURNING *`,
    [
      title, description, price, discount_percentage, rating,
      stock, minimum_order_quantity, brand, category, sku,
      weight, availability_status, warranty_information,
      shipping_information, return_policy
    ]
  );

  const productId = prodResult.rows[0].id;

  //dimensions:
   if (dimensions) {
      const { width, height, depth } = dimensions;
      await query(
        `INSERT INTO product_dimensions (product_id, width, height, depth)
         VALUES ($1, $2, $3, $4)`,
        [productId, width, height, depth]
      );
    }

   //images
   
   for (const { url, is_thumbnail = false } of images) {
      await query(
        `INSERT INTO product_images (product_id, url, is_thumbnail)
         VALUES ($1, $2, $3)`,
        [productId, url, is_thumbnail]
      );
    }

    //tags

     for (const tagName of tags) {
      const tagRes = await query(`INSERT INTO tags (name)
        VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [tagName]);
      const tagId = tagRes.rows[0].id;

      await query(`INSERT INTO product_tags (product_id, tag_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING`, [productId, tagId]);
    }

    ///  reviews
      for (const rev of reviews) {
        const { rating, comment, reviewer_name, reviewer_email, review_date } = rev;
        await query(
          `INSERT INTO reviews (
            product_id, rating, comment,
            reviewer_name, reviewer_email, review_date
          ) VALUES ($1,$2,$3,$4,$5,$6)`,
          [productId, rating, comment, reviewer_name, reviewer_email, review_date]
        );
      }

    //meta

    if (meta) {
      const { created_at, updated_at, barcode, qr_code } = meta;
      await query(`INSERT INTO product_meta (
        product_id, created_at, updated_at, barcode, qr_code
      ) VALUES ($1, $2, $3, $4, $5)`,
        [productId, created_at, updated_at, barcode, qr_code]);
    }
    return prodResult.rows[0];
  } catch (err) {
    console.log("ERROR IN QUERY")
    throw err;
  }
};


export const updateProduct = async(productId, productData) => {
  try{
    const {
    title, description, price, discount_percentage, rating,
    stock, minimum_order_quantity, brand, category, sku,
    weight, availability_status, warranty_information,
    shipping_information, return_policy, dimensions, images = [], tags = [], reviews = [], meta
  } = productData;

    console.log("PRODUCT DATA>>", productData)
    const { rows } = await query(
        `UPDATE products SET title =$1, description=$2, price=$3, discount_percentage=$4, rating=$5,
      stock=$6, minimum_order_quantity=$7, brand=$8, category=$9, sku=$10,
      weight=$11, availability_status=$12, warranty_information=$13,
      shipping_information=$14, return_policy = $15
        WHERE id =$16 RETURNING *`, [title, description, price, discount_percentage, rating, stock, minimum_order_quantity, brand, category, sku, weight, availability_status, warranty_information, shipping_information, return_policy, productId] 
    );

    // Dimensions (Upsert)
    if (dimensions) {
      const { width, height, depth } = dimensions;
      await query(`
        INSERT INTO product_dimensions (product_id, width, height, depth)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_id) DO UPDATE SET width = $2, height = $3, depth = $4
      `, [productId, width, height, depth]);
    }

    // // Images (simple delete and re-insert)
    // await query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
    // for (const { url, is_thumbnail = false } of images) {
    //   await query(`INSERT INTO product_images (product_id, url, is_thumbnail)
    //     VALUES ($1, $2, $3)`, [productId, url, is_thumbnail]);
    // }

    // Tags (delete then re-add)
    await query(`DELETE FROM product_tags WHERE product_id = $1`, [productId]);
    for (const tagName of tags) {
      const tagRes = await client.query(`INSERT INTO tags (name)
        VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [tagName]);
      const tagId = tagRes.rows[0].id;
      await query(`INSERT INTO product_tags (product_id, tag_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING`, [productId, tagId]);
    }

    //reviews
    await query(
    `DELETE FROM reviews WHERE product_id = $1`,
    [productId]
);


    for (const { rating, comment, reviewer_name, reviewer_email, review_date } of reviews) {
  await query(
    `INSERT INTO reviews (
       product_id, rating, comment,
       reviewer_name, reviewer_email, review_date
     ) VALUES ($1,$2,$3,$4,$5,$6)`,
    [productId, rating, comment, reviewer_name, reviewer_email, review_date]
  );
}

    // Meta (upsert)
    if (meta) {
      const { created_at, updated_at, barcode, qr_code } = meta;
      await query(`
        INSERT INTO product_meta (product_id, created_at, updated_at, barcode, qr_code)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (product_id)
        DO UPDATE SET created_at = $2, updated_at = $3, barcode = $4, qr_code = $5
      `, [productId, created_at, updated_at, barcode, qr_code]);
    }


    return rows[0];}
    catch (err) {
      console.log("ERROR IN UPDATE QUERY")
      throw err;

    }
}

export const deleteProduct = async (productId) => {
    const { rowCount } = await query(`DELETE FROM products WHERE id=$1`,[productId]);
    return rowCount > 0;
}


//images section


export const addImages = async (productId, files, req) => {
  const inserted = [];

  for (const file of files) {
    // Construct the public URL
    const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    const { rows } = await query(
      `INSERT INTO product_images (product_id, url, is_thumbnail)
       VALUES ($1, $2, FALSE)
       RETURNING id, url, is_thumbnail`,
      [productId, url]
    );
    inserted.push(rows[0]);
  }

  return inserted;
};

export const deleteImage = async (imageId) => {
  const { rowCount } = await query(
    'DELETE FROM product_images WHERE id=$1',
    [imageId]
  );
  console.log("THE QUERY WORKS FOR DEL IMG")
  return rowCount > 0;
};

