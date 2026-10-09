import { Sale } from "./sale.model";
import { Client } from "../clients/client.model";

Sale.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(Sale, { foreignKey: "client_id", as: "sales" });
