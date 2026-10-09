import { faker } from "@faker-js/faker";
import { sequelize } from "../../../database/db";
import { ProductSale } from "./product-sale.model";
import { Sale } from "../sales/sale.model";
import { Product } from "../products/product.model";

export async function seedProductSales(count: number): Promise<number> {
  if (count <= 0) {
    console.log("product_sales: count=0, se omite");
    return 0;
  }

  const existing = await ProductSale.count();
  if (existing > 0) {
    console.log(`product_sales: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const sales = await Sale.findAll({ where: { status: "active" } });
  const products = await Product.findAll({ where: { status: "active" } });
  if (sales.length === 0 || products.length === 0) {
    console.log("product_sales: faltan ventas o productos activos, se omite seeder");
    return 0;
  }

  let created = 0;
  let attempts = 0;
  const maxAttempts = sales.length * 3;

  while (created < count && attempts < maxAttempts) {
    const sale = sales[attempts % sales.length];
    const product = faker.helpers.arrayElement(products);
    attempts += 1;

    const inserted = await sequelize.transaction(async (transaction) => {
      const currentSale = await Sale.findByPk(sale.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!currentSale || currentSale.status !== "active") {
        return false;
      }

      const currentProduct = await Product.findByPk(product.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (
        !currentProduct ||
        currentProduct.status !== "active" ||
        currentProduct.quantity < 1
      ) {
        return false;
      }

      const quantity = faker.number.int({
        min: 1,
        max: Math.min(3, currentProduct.quantity),
      });
      const unitPrice = Number(currentProduct.price);
      const lineTotal = unitPrice * quantity;

      await ProductSale.create(
        {
          sale_id: currentSale.id,
          product_id: currentProduct.id,
          quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
          status: "active",
        },
        { transaction },
      );
      await currentProduct.update(
        { quantity: currentProduct.quantity - quantity },
        { transaction },
      );

      const items = await ProductSale.findAll({
        where: { sale_id: currentSale.id, status: "active" },
        transaction,
      });
      const subtotal = items.reduce(
        (sum, row) => sum + Number(row.line_total),
        0,
      );
      const total =
        subtotal + Number(currentSale.tax) - Number(currentSale.discounts);
      await currentSale.update({ subtotal, total }, { transaction });
      return true;
    });

    if (inserted) {
      created += 1;
    }
  }

  console.log(`product_sales: insertados ${created} registro(s) falsos`);
  return created;
}
