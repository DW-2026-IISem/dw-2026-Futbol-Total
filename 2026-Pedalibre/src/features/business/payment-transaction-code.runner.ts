import { DataTypes, QueryInterface } from "sequelize";
import { sequelize, testConnection } from "../../database/db";

export async function addPaymentTransactionCode(
  queryInterface: QueryInterface = sequelize.getQueryInterface(),
): Promise<void> {
  const columns = await queryInterface.describeTable("payments");
  if (!("transaction_code" in columns)) {
    await queryInterface.addColumn("payments", "transaction_code", {
      type: DataTypes.STRING(120),
      allowNull: true,
    });
    console.log("payments.transaction_code creado.");
  }
  if (!columns.reservation_id) {
    await queryInterface.addColumn("payments", "reservation_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "reservations", key: "reservation_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    console.log("payments.reservation_id creado.");
  }
  if (!columns.rate_id) {
    await queryInterface.addColumn("payments", "rate_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "rates", key: "rate_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    console.log("payments.rate_id creado.");
  }
  if (columns.reference_id.allowNull === false) {
    await queryInterface.changeColumn("payments", "reference_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    console.log("payments.reference_id ahora permite nulos durante el prepago.");
  }
}

if (require.main === module) {
  testConnection()
    .then(async (connected) => {
      if (!connected) throw new Error("No hay conexión a la base de datos.");
      await addPaymentTransactionCode();
    })
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error: unknown) => {
      console.error("No se pudo actualizar la tabla de pagos:", error);
      await sequelize.close();
      process.exit(1);
    });
}
