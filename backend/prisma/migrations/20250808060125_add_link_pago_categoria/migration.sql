-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Servicio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "monto" DECIMAL NOT NULL,
    "vencimiento" DATETIME NOT NULL,
    "periodicidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'por_pagar',
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkPago" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'Otros',
    CONSTRAINT "Servicio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Servicio" ("createdAt", "estado", "id", "monto", "nombre", "periodicidad", "userId", "vencimiento") SELECT "createdAt", "estado", "id", "monto", "nombre", "periodicidad", "userId", "vencimiento" FROM "Servicio";
DROP TABLE "Servicio";
ALTER TABLE "new_Servicio" RENAME TO "Servicio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
