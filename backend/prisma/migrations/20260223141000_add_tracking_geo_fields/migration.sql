-- AlterTable
ALTER TABLE "Trip"
ADD COLUMN "from_lat" DOUBLE PRECISION,
ADD COLUMN "from_lng" DOUBLE PRECISION,
ADD COLUMN "to_lat" DOUBLE PRECISION,
ADD COLUMN "to_lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TripTracking"
ADD COLUMN "h3_index" TEXT,
ADD COLUMN "speed" DOUBLE PRECISION,
ADD COLUMN "heading" DOUBLE PRECISION,
ADD COLUMN "accuracy" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "TripTracking_h3_index_idx" ON "TripTracking"("h3_index");

-- CreateIndex
CREATE INDEX "TripTracking_trip_id_updated_at_idx" ON "TripTracking"("trip_id", "updated_at");
