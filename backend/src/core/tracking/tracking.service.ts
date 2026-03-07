import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTripTrackingInput } from './dto/update-trip-tracking.input';
import { NearbyDriver } from './entities/nearby-driver.entity';

const EARTH_RADIUS_KM = 6371;
const GRID_SIZE_DEG = 0.05;

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  private toGridCell(lat: number, lng: number): string {
    const latCell = Math.floor((lat + 90) / GRID_SIZE_DEG);
    const lngCell = Math.floor((lng + 180) / GRID_SIZE_DEG);
    return `${latCell}:${lngCell}`;
  }

  private gridNeighbors(index: string): string[] {
    const [latCellRaw, lngCellRaw] = index.split(':');
    const latCell = Number(latCellRaw);
    const lngCell = Number(lngCellRaw);
    const neighbors: string[] = [];

    for (let latDelta = -2; latDelta <= 2; latDelta += 1) {
      for (let lngDelta = -2; lngDelta <= 2; lngDelta += 1) {
        neighbors.push(`${latCell + latDelta}:${lngCell + lngDelta}`);
      }
    }

    return neighbors;
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  async updateTripTracking(userId: number, input: UpdateTripTrackingInput) {
    if (input.latitude < -90 || input.latitude > 90 || input.longitude < -180 || input.longitude > 180) {
      throw new BadRequestException('Ungültige Koordinaten.');
    }

    const trip = await this.prisma.trip.findUnique({ where: { id: input.trip_id } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (trip.user_id !== userId) {
      throw new ForbiddenException('Nur der Fahrer darf Tracking senden.');
    }
    if (!trip.is_active) {
      throw new BadRequestException('Tracking nur bei aktiver Fahrt erlaubt.');
    }

    const h3Index = this.toGridCell(input.latitude, input.longitude);

    const existing = await this.prisma.tripTracking.findFirst({ where: { trip_id: input.trip_id } });

    if (existing) {
      return this.prisma.tripTracking.update({
        where: { id: existing.id },
        data: {
          latitude: input.latitude,
          longitude: input.longitude,
          status: input.status ?? existing.status,
          speed: input.speed ?? null,
          heading: input.heading ?? null,
          accuracy: input.accuracy ?? null,
          h3_index: h3Index,
          updated_at: new Date(),
        },
      });
    }

    return this.prisma.tripTracking.create({
      data: {
        trip_id: input.trip_id,
        latitude: input.latitude,
        longitude: input.longitude,
        status: input.status,
        speed: input.speed,
        heading: input.heading,
        accuracy: input.accuracy,
        h3_index: h3Index,
      },
    });
  }

  async nearbyDrivers(lat: number, lng: number, radiusKm: number): Promise<NearbyDriver[]> {
    const h3Index = this.toGridCell(lat, lng);
    const candidates = await this.prisma.tripTracking.findMany({
      where: {
        h3_index: { in: this.gridNeighbors(h3Index) },
        trip: { is_active: true, type: 'angebot' },
      },
      include: {
        trip: true,
      },
      take: 100,
      orderBy: {
        updated_at: 'desc',
      },
    });

    return candidates
      .filter((item) => item.latitude !== null && item.longitude !== null)
      .map((item) => {
        const distance = this.haversineKm(lat, lng, item.latitude as number, item.longitude as number);
        return {
          trip_id: item.trip_id,
          driver_id: item.trip.user_id,
          latitude: item.latitude as number,
          longitude: item.longitude as number,
          distance_km: distance,
          status: item.status ?? undefined,
          updated_at: item.updated_at,
          from_location: item.trip.from_location,
          to_location: item.trip.to_location,
        };
      })
      .filter((item) => item.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);
  }
}
