import { ProductSale } from "./product-sale.model";
import { Sale } from "../sales/sale.model";
import { Product } from "../products/product.model";

ProductSale.belongsTo(Sale, { foreignKey: "sale_id", as: "sale" });
ProductSale.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Sale.hasMany(ProductSale, { foreignKey: "sale_id", as: "items" });
Product.hasMany(ProductSale, { foreignKey: "product_id", as: "sale_items" });
