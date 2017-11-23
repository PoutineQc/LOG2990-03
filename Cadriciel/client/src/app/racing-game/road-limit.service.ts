import { LineCalculationService } from './line-calculation.service';
import { Injectable } from '@angular/core';
import { Track } from './track';
import { Vector2, Vector3 } from 'three';
import { VehicleMoveEventService, VehicleMoveEvent } from './events/vehicle-move-event.service';
import { Vehicle } from './vehicle';

@Injectable()
export class RoadLimitService {

    constructor(private lineCalculationService: LineCalculationService, private vehicleMoveEventService: VehicleMoveEventService) {
        this.vehicleMoveEventService.getVehicleMoveObservable().subscribe((vehicleMoveEvent: VehicleMoveEvent) => {
            if (!this.isMovementValid(vehicleMoveEvent.getVehicle().getTrack(), vehicleMoveEvent.getNewPosition())) {
                this.snapToTrack(vehicleMoveEvent.getVehicle(), vehicleMoveEvent.getNewPosition());
            }
        });
    }

    private isMovementValid(track: Track, newPosition: Vector3): boolean {
        return track.distanceToPoint(new Vector2(newPosition.x / 25, newPosition.z / 25), this.lineCalculationService) < 10;
    }

    private snapToTrack(vehicle: Vehicle, newPosition: Vector3) {
        const track = vehicle.getTrack();
        const newPositionRaw = new Vector2(newPosition.x / 25, newPosition.z / 25);
        const nearestPoint = track.getNearestPointOnTrack(newPositionRaw, this.lineCalculationService);
        const nearestPointOffset = new Vector2().subVectors(newPositionRaw, nearestPoint);
        const newPositionAjusted = new Vector2().addVectors(nearestPoint, nearestPointOffset.clampLength(0, 10)).multiplyScalar(25);
        newPosition.x = newPositionAjusted.x;
        newPosition.z = newPositionAjusted.y;
        vehicle.hitWall(Math.abs(Math.cos(
            (Math.atan(nearestPointOffset.y / nearestPointOffset.x)) + ((vehicle.getVehicle().rotation.y % (Math.PI)))
        )));
    }
}