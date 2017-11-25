import { Injectable } from '@angular/core';
import { Vehicle } from './vehicle';
import * as THREE from 'three';
@Injectable()
export class CollisionResolveService {

  constructor() { }

  public resolveCollision(vehicleA: Vehicle, vehicleB: Vehicle, xCollisionPoint: number,
    zCollisionPoint: number, xCollisionPlanePoint, zCollisionPlanePoint) {
  }

  public calculateNormal(xCollisionPoint: number, zCollisionPoint: number, xCollisionPlanePoint, zCollisionPlanePoint): THREE.Vector3 {
    const dx = xCollisionPlanePoint - xCollisionPoint;
    const dz = zCollisionPlanePoint - zCollisionPoint;
    const normal = new THREE.Vector3(-dz, 0, dx);
    return normal;
  }

  public calculateDistanceVector(xPoint1: number, zPoint1: number, xPoint2: number, zPoint2: number): THREE.Vector3 {
    const dx = xPoint2 - xPoint1;
    const dz = zPoint2 - zPoint1;
    const vector = new THREE.Vector3(dx, 0, dz);
    return vector;
  }

  public getCorrectNormalDirection(normal: THREE.Vector3, xVehicleA: number, zvehicleA: number,
    xVehicleB: number, zvehicleB: number): void {
    const distanceVector = this.calculateDistanceVector(xVehicleB, zvehicleB, xVehicleA, zvehicleA);

    if ((distanceVector.x < 0 && normal.x > 0) || (distanceVector.x > 0 && normal.x < 0)) {
      normal.x = normal.x * -1;
    }
    if ((distanceVector.z < 0 && normal.z > 0) || (distanceVector.z > 0 && normal.z < 0)) {
      normal.z = normal.z * -1;
    }
    normal.normalize();
  }
}
