const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// // The `/api/products` endpoint

// // Get all products
// router.get('/', async (req, res) => {
//   try {
//     const productData = await Product.findAll({
//       include: [
//         { model: Category },
//         { model: Tag, through: ProductTag }
//       ]
//     });
//     res.status(200).json(productData);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // Get one product by id
// router.get('/:id', async (req, res) => {
//   try {
//     const productData = await Product.findByPk(req.params.id, {
//       include: [
//         { model: Category },
//         { model: Tag, through: ProductTag }
//       ]
//     });

//     if (!productData) {
//       res.status(404).json({ message: 'No product found with this id!' });
//       return;
//     }

//     res.status(200).json(productData);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // Create a new product
// router.post('/', async (req, res) => {
//   try {
//     const newProduct = await Product.create(req.body);

//     // If there are product tags, create pairings to bulk create in ProductTag model
//     if (req.body.tagIds.length) {
//       const productTagIdArr = req.body.tagIds.map((tag_id) => {
//         return {
//           product_id: newProduct.id,
//           tag_id,
//         };
//       });
//       await ProductTag.bulkCreate(productTagIdArr);
//     }

//     res.status(200).json(newProduct);
//   } catch (err) {
//     res.status(400).json(err);
//   }
// });

// module.exports = router;

 // Create product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, create pairings in ProductTag model
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });

        // Bulk create product tags and return the product
        return ProductTag.bulkCreate(productTagIdArr).then(() =>
          res.status(200).json(product)
        );
      }
      // No tags, return the product
      res.status(200).json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// Update product
router.put('/:id', (req, res) => {
  // Update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        // Find all existing tags
        return ProductTag.findAll({
          where: { product_id: req.params.id },
        })
          .then((productTags) => {
            const productTagIds = productTags.map(({ tag_id }) => tag_id);

            // Create a filtered list of new tag_ids
            const newProductTags = req.body.tagIds
              .filter((tag_id) => !productTagIds.includes(tag_id))
              .map((tag_id) => {
                return {
                  product_id: req.params.id,
                  tag_id,
                };
              });

            // Find which tags to remove
            const productTagsToRemove = productTags
              .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
              .map(({ id }) => id);

            // Run both actions (remove and create tags)
            return Promise.all([
              ProductTag.destroy({ where: { id: productTagsToRemove } }),
              ProductTag.bulkCreate(newProductTags),
            ]);
          })
          .then((updatedTags) => res.json({ product, updatedTags }));
      }

      // If no tags are provided, just return the product
      return res.json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// Delete product
router.delete('/:id', (req, res) => {
  // Delete a product by its `id` value
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((deleted) => {
      if (!deleted) {
        return res.status(404).json({ message: 'No product found with this id!' });
      }
      res.status(200).json({ message: 'Product deleted successfully!' });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

module.exports = router;