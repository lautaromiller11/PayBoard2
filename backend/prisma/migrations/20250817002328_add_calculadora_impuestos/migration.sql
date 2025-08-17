-- CreateTable
CREATE TABLE "Rate" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "compra" DECIMAL(65,30),
    "venta" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tipoEnum" TEXT NOT NULL,
    "valuePct" DECIMAL(65,30) NOT NULL,
    "scope" TEXT NOT NULL,
    "provinceCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "inputJson" TEXT NOT NULL,
    "outputJson" TEXT NOT NULL,
    "ratesSnapshotJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rate_tipo_fetchedAt_idx" ON "Rate"("tipo", "fetchedAt");

-- CreateIndex
CREATE INDEX "TaxRule_tipoEnum_active_idx" ON "TaxRule"("tipoEnum", "active");

-- CreateIndex
CREATE INDEX "TaxRule_provinceCode_active_idx" ON "TaxRule"("provinceCode", "active");

-- CreateIndex
CREATE INDEX "CalculationLog_userId_createdAt_idx" ON "CalculationLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CalculationLog" ADD CONSTRAINT "CalculationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
