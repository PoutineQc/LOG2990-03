import { VehicleColor } from './vehicle-color';
import { VehicleService } from './vehicle.service';
import { CollisionEventService, CollisionEvent } from './events/collision-event.service';
import { VehicleMoveEvent } from './events/vehicle-move-event.service';
import { Injectable } from '@angular/core';
import { Mesh, Geometry, Vector3, Object3D, ObjectLoader } from 'three';
import { Vehicle } from './vehicle';
import { Settings } from './settings';

@Injectable()
export class CollisionDetectionService {

    private amountBoundingBoxesCreated;

    constructor(
        private collisionEventService: CollisionEventService,
        private vehicleService: VehicleService
    ) {
        this.amountBoundingBoxesCreated = 0;
    }

    public generateBoundingBox(vehicle: Vehicle): void {
        new ObjectLoader().load(`${Settings.ASSETS_FOLDER}/${Settings.PATH_BOUNDING_BOX}`, (box: Object3D) => {
            vehicle.setSize(this.calculateBoxSize(<Mesh>box));
            vehicle.setBoundingBox(<Mesh>box);
            this.amountBoundingBoxesCreated++;
        });
    }

    public checkForCollisionWithCar(event: VehicleMoveEvent): void {
        if (this.amountBoundingBoxesCreated !== Object.keys(VehicleColor).length / 2) {
            return;
        }

        const box = event.getVehicle().getBoundingBox();
        this.vehicleService.getVehicles().forEach((toCheck: Vehicle) => {
            if (toCheck !== event.getVehicle()) {
                const box2 = toCheck.getBoundingBox();

                box.updateMatrixWorld(true);
                const vertices1 = this.extractWorldVertices(box);
                box2.updateMatrixWorld(true);
                const vertices2 = this.extractWorldVertices(box2);

                const intersectingPoint = this.checkForIntersection(vertices1, vertices2);
                if (intersectingPoint !== null) {
                    event.cancel();
                    this.collisionEventService.sendCollisionEvent(
                        new CollisionEvent(
                            event.getVehicle(), toCheck, intersectingPoint, this.closestVertexToPoint(intersectingPoint, vertices2))
                    );

                }
            }
        });
    }

    private closestVertexToPoint(collisionPoint: Vector3, points: Vector3[]): Vector3 {
        let closestPoint = null;
        let closestDistance = Infinity;
        points.forEach((point: Vector3) => {
            const distance = point.distanceTo(collisionPoint);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        });
        return closestPoint;
    }

    private extractWorldVertices(object: Mesh): Vector3[] {
        return (<Geometry>object.geometry).vertices.map(vertice => {
            const vector = vertice.clone();
            vector.applyMatrix4(object.matrixWorld);
            return vector;
        });
    }

    private checkForIntersection(box1: Vector3[], box2: Vector3[]): Vector3 {
        let intersectingPoint = null;
        box1.forEach((vertice: Vector3) => {
            if (this.isVerticeInsideRectangle(vertice, box2)) {
                intersectingPoint = vertice;
            }
        });

        return intersectingPoint;
    }

    private isVerticeInsideRectangle(vertice: Vector3, box2: Vector3[]): boolean {
        const rectangleArea = this.getRectangleArea(box2[0], box2[1], box2[2], box2[3]);
        const triangleSumArea = this.getTriangleArea(box2[0], box2[1], vertice) +
            this.getTriangleArea(box2[1], box2[2], vertice) +
            this.getTriangleArea(box2[2], box2[3], vertice) +
            this.getTriangleArea(box2[3], box2[0], vertice);
        return rectangleArea >= triangleSumArea;
    }

    private getRectangleArea(point1: Vector3, point2: Vector3, point3: Vector3, point4: Vector3): number {
        return this.getTriangleArea(point1, point2, point3) + this.getTriangleArea(point2, point3, point4);
    }

    private getTriangleArea(point1: Vector3, point2: Vector3, point3: Vector3): number {
        return Math.abs((point1.x * (point2.z - point3.z)) + (point2.x * (point3.z - point1.z)) + (point3.x * (point1.z - point2.z))) / 2;
    }

    private calculateBoxSize(box: Mesh): { width: number, length: number } {
        const vertices = this.extractWorldVertices(box);
        const distances: number[] = [];
        for (let i = 1; i < vertices.length; i++) {
            distances.push(vertices[0].distanceToSquared(vertices[i]));
        }
        distances.sort((a, b) => a - b);
        const size = { width: Math.sqrt(distances[0]), length: Math.sqrt(distances[1]) };
        return size;
    }
}
