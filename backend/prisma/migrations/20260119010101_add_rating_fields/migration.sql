-- Add rating fields for driver ratings
ALTER TABLE "TripRatingDriver"
ADD COLUMN "stars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "comment" TEXT;

-- Add rating fields for passenger ratings
ALTER TABLE "TripRatingPassenger"
ADD COLUMN "stars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "comment" TEXT;
