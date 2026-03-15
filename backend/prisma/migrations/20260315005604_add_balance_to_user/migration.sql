-- CreateEnum
CREATE TYPE "MotorType" AS ENUM ('benzin', 'diesel', 'hybrid', 'elektro', 'gas', 'sonstiges');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('ausstehend', 'bezahlt', 'storniert', 'fehlgeschlagen');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "load_area" DOUBLE PRECISION,
ADD COLUMN     "motor_type" "MotorType";

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "trip_passenger_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'ausstehend',
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transaction_id_key" ON "Payment"("transaction_id");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_trip_passenger_id_fkey" FOREIGN KEY ("trip_passenger_id") REFERENCES "TripPassenger"("id") ON DELETE CASCADE ON UPDATE CASCADE;
