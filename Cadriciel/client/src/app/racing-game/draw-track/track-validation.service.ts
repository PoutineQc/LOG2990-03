import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class TrackValidationService {
    public trackElements: {
        intersection: THREE.Vector3,
        intersectionAngle: number[],
        segmentLength: number,
        segmentIntersections: number[]
    }[] = [{ intersection: new THREE.Vector3(), intersectionAngle: [0, 0], segmentLength: 0, segmentIntersections: [] }];

    public trackClosed = false;

    public addPoint(intersection: THREE.Vector3) {
        this.trackElements.push(
            { intersection, intersectionAngle: [0, 0], segmentLength: 0, segmentIntersections: [] }
        );
        this.checkSegmentLength(this.trackElements.length - 2);
        this.checkSegmentIntersections(this.trackElements.length - 2);
        this.checkPointAngle(this.trackElements.length - 2);
    }

    public updatePoint(index: number, intersection: THREE.Vector3) {
        this.trackElements[index].intersection = intersection;
        this.checkSegmentLength(index);
        this.checkSegmentLength(index - 1 < 0 ? this.trackElements.length - 1 : index - 1);
        this.checkSegmentIntersections(index);
        this.checkSegmentIntersections(index - 1 < 0 ? this.trackElements.length - 1 : index - 1);
        this.checkPointAngle(index - 1 < 0 ? this.trackElements.length - 1 : index - 1);
        this.checkPointAngle(index);
        this.checkPointAngle(index + 1 === this.trackElements.length ? 0 : index + 1);
    }

    public removeLastPoint() {
        this.trackElements.splice(this.trackElements.length - (this.trackClosed ? 1 : 2), 1);
        this.trackElements.forEach((segment, index, segments) => {
            const removedPosition = segment.segmentIntersections.indexOf(segments.length - 1);
            if (-1 < removedPosition) {
                segment.segmentIntersections.splice(removedPosition, 1);
            }
        });
        this.checkSegmentIntersections(this.trackElements.length - 2);
    }

    public checkSegmentLength(index: number) {
        const line = this.getLine(index);
        this.trackElements[index].segmentLength = this.distance(line.point1, line.point2);
    }

    public checkSegmentIntersections(index: number) {
        const service = this;
        this.trackElements.forEach(
            (segment, i, segments) => {
                if ((Math.abs(index - i) < 2 || Math.abs(index - i) === (segments.length - 1)) ||
                    (!service.trackClosed && (i === segments.length - 1 ||  index === segments.length - 1))) {
                    return;
                }

                if (i === 0 && service.distance(segments[0].intersection, segments[index + 1].intersection) < 25) {
                    service.updateSegmentsValidity(25 + 1, i, index);
                    return;
                }

                const line1 = service.getLine(index);
                const line2 = service.getLine(i);
                const intersection = service.twoLineIntersection(line1, line2);
                // Evaluate for two paralele lines

                let clampDistances: number[] = [];
                const optimisedDistancesLine1: number[] = service.checkForClamp(intersection, line1, line2);
                clampDistances = clampDistances.concat(optimisedDistancesLine1);
                const optimisedDistancesLine2: number[] = service.checkForClamp(intersection, line2, line1);
                clampDistances = clampDistances.concat(optimisedDistancesLine2);

                const minimumSegmentsDistance = clampDistances.length > 0 ? service.minimum(clampDistances) : 0;
                service.updateSegmentsValidity(minimumSegmentsDistance, i, index);
            }
        );
    }

    public getLine(index) {
        return {
            point1: this.trackElements[index].intersection,
            point2: this.trackElements[index + 1 === this.trackElements.length ? 0 : index + 1].intersection
        };
    }

    public twoLineIntersection( line1, line2 ): {x: number, y: number} {
        const lineParameters1 = this.getLineParameters(line1);
        const lineParameters2 = this.getLineParameters(line2);

        const x = (lineParameters2.b - lineParameters1.b) / (lineParameters1.a - lineParameters2.a);
        return {x, y: this.solveLineEquation(x, lineParameters1)};
    }

    public checkForClamp(intersection, line1, line2): number[] {
        const distance: number[] = [];

        if (
            Math.min(line1.point1.x, line1.point2.x) <= intersection.x &&
            Math.max(line1.point1.x, line1.point2.x) >= intersection.x &&
            Math.min(line1.point1.y, line1.point2.y) <= intersection.y &&
            Math.max(line1.point1.y, line1.point2.y) >= intersection.y
        ) {
            return distance;
        } else {
            const optimalPoint = {x: NaN, y: NaN};
            optimalPoint.x = Math.abs(intersection.x - line1.point1.x) < Math.abs(intersection.x - line1.point2.x) ?
                line1.point1.x :
                line1.point2.x;
            optimalPoint.y = Math.abs(intersection.y - line1.point1.y) < Math.abs(intersection.y - line1.point2.y) ?
                line1.point1.y :
                line1.point2.y;

            distance.push(this.clampAndGetOptimalPoint(optimalPoint, line1, line2));
        }
        return distance;
    }

    public distanceToLine(point, line) {
        return this.distance(point, this.getNearestPointOnLine(point, line));
    }

    public getNearestPointOnLine(point, line) {
        const lineParameters = this.getLineParameters(line);
        const slope = -1 / lineParameters.a;
        const permenticularParameters = {a: slope, b: this.solveYIntercept(point, slope)};

        const xOptimal = (permenticularParameters.b - lineParameters.b) / (lineParameters.a - permenticularParameters.a);
        return {x: xOptimal, y: this.solveLineEquation(xOptimal, permenticularParameters)};
    }

    public updateSegmentsValidity(minimumSegmentsDistance: number, index1: number, index2: number) {
        if (minimumSegmentsDistance < 25) {
            if (-1 === this.trackElements[index2].segmentIntersections.indexOf(index1)) {
                this.trackElements[index2].segmentIntersections.push(index1);
                this.trackElements[index1].segmentIntersections.push(index2);
            }
        } else {
            const arrayPosition1 = this.trackElements[index2].segmentIntersections.indexOf(index1);
            if (-1 < arrayPosition1) {
                this.trackElements[index2].segmentIntersections.splice(arrayPosition1, 1);
                const arrayPosition2 = this.trackElements[index1].segmentIntersections.indexOf(index2);
                this.trackElements[index1].segmentIntersections.splice(arrayPosition2, 1);
            }
        }
    }

    public clampAndGetOptimalPoint(clampedPoint, line1, line2): number {
        const optimalPoint = this.getNearestPointOnLine(clampedPoint, line2);
        return this.findOptimalPoint(clampedPoint, line1, optimalPoint, line2);
    }

    public findOptimalPoint(clampedPoint, line1, optimalPoint, line2): number {
        let distances: number[] = [];
        if (
            Math.min(line2.point1.x, line2.point2.x) <= optimalPoint.x &&
            Math.max(line2.point1.x, line2.point2.x) >= optimalPoint.x &&
            Math.min(line2.point1.y, line2.point2.y) <= optimalPoint.y &&
            Math.max(line2.point1.y, line2.point2.y) >= optimalPoint.y
        ) {
            const clampToOptimalDistance = this.distance(clampedPoint, optimalPoint);
            distances.push(clampToOptimalDistance);
        } else {
            const endToEndDistances = this.getAllEndToEndDistances(line1, line2);
            distances = distances.concat(endToEndDistances);
        }
        return this.minimum(distances);
    }

    public solveYIntercept(point, slope): number {
        return (point.y - (slope * point.x));
    }

    public solveLineEquation(x, lineParameters): number {
        return (lineParameters.a * x) + lineParameters.b;
    }

    public minimum(array: number[]): number {
        let minimum = array[0];
        array.forEach(
            (number) => {
                if (number < minimum) {
                    minimum = number;
                }
            }
        );
        return minimum;
    }

    public distance(point1: {x: number, y: number}, point2: {x: number, y: number}): number {
        return Math.sqrt(
            Math.pow((point1.x - point2.x), 2) +
            Math.pow((point1.y - point2.y), 2)
        );
    }

    public getLineParameters( line ): {a: number, b: number} {
        const a = (line.point2.y - line.point1.y) / (line.point2.x - line.point1.x);
        const b = (line.point1.y - (a * line.point1.x));
        return {a, b};
    }

    public getAllEndToEndDistances( line1, line2 ): number[] {
        const distances: number[] = [];

        distances.push(this.distance( line1.point1, line2.point1 ));
        distances.push(this.distance( line1.point1, line2.point2 ));
        distances.push(this.distance( line1.point2, line2.point1 ));
        distances.push(this.distance( line1.point2, line2.point2 ));

        return distances;
    }

    public checkPointAngle(index: number) {
        if (!this.trackClosed && (index === 0 || index === this.trackElements.length - 1)) {
            return;
        }

        const line1 = this.getLine(index);
        const line2 = this.getLine((index - 1) === -1 ? this.trackElements.length - 1 : index - 1);
        const angle1 = this.getAngle(line1);
        const angle2 = this.getAngle(line2);
        const rawAngleVariation = angle2 - angle1 + (Math.PI / 2);
        const angleVariation = rawAngleVariation % (2 * Math.PI);
        this.trackElements[index - 1 === -1 ? this.trackElements.length - 1 : index - 1].intersectionAngle[0] = angleVariation;
        this.trackElements[index].intersectionAngle[1] = angleVariation;
    }

    public getAngle(line): number {
        const rawAngle = Math.atan((line.point2.y - line.point1.y) / (line.point2.x - line.point1.x));
        return (
            (line.point2.x - line.point1.x > 0) ||
            (line.point2.x - line.point1.x === 0 && line.point2.y - line.point1.y >= 0)
        ) ? rawAngle : rawAngle + Math.PI;
    }

    public isValid(index: number) {
        return (/*this.trackElements[index].segmentIntersections.length === 0 &&
                this.trackElements[index].segmentLength >= 40 &&*/
                (this.trackElements[index].intersectionAngle[1] <= Math.PI &&
                    this.trackElements[index].intersectionAngle[0] <= Math.PI));
    }
}
