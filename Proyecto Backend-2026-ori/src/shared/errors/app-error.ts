/**
 * Error de aplicación con código HTTP asociado.
 *
 * Lo lanzan los services cuando una regla de negocio no se cumple.
 * Los controllers lo traducen a una respuesta HTTP.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  public constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
