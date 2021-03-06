import { TrackService } from './../game-initialization/track.service';
import { ObstacleService } from './obstacle.service';
import { ObstacleType } from './obstacle';
import { DrawTrackRenderService } from './draw-track-render.service';
import { TrackValidationService } from './track-validation.service';
import { Injectable } from '@angular/core';
import { Track } from '../track';
import * as THREE from 'three';

@Injectable()
export class DrawTrackService {

    private container: HTMLElement;

    private mousePosition: THREE.Vector2;

    private pointMouseHoversOn: number;

    private trackClosed: boolean;

    private intersections: THREE.Vector2[];

    private currentlyDraggedIntersection: number;

    constructor(
        private renderService: DrawTrackRenderService,
        private trackValidationService: TrackValidationService,
        private obstacleService: ObstacleService,
        private trackService: TrackService
    ) {
        this.mousePosition = new THREE.Vector2();
        this.pointMouseHoversOn = -1;
        this.trackClosed = false;
        this.intersections = [new THREE.Vector2(0, 0)];
        this.currentlyDraggedIntersection = -1;
    }

    public async loadTrack(name: string): Promise<{ description: string, difficulty: string }> {
        return this.trackService.get(name).then(track => {
            this.loadIntersection(track.trackIntersections.map(intersection => new THREE.Vector2(intersection.x, -intersection.y)));
            this.obstacleService.loadObstacles(ObstacleType.Booster, track.boosters);
            this.obstacleService.loadObstacles(ObstacleType.Pothole, track.potholes);
            this.obstacleService.loadObstacles(ObstacleType.Puddle, track.puddles);
            this.renderService.updateObstaclesPositions(ObstacleType.Booster, this.obstacleService.getObstacles(ObstacleType.Booster));
            this.renderService.updateObstaclesPositions(ObstacleType.Pothole, this.obstacleService.getObstacles(ObstacleType.Pothole));
            this.renderService.updateObstaclesPositions(ObstacleType.Puddle, this.obstacleService.getObstacles(ObstacleType.Puddle));
            return { description: track.description, difficulty: track.type };
        });
    }

    private loadIntersection(trackIntersections: THREE.Vector2[]): void {
        trackIntersections.forEach(intersection => {
            this.mousePosition = new THREE.Vector2(intersection.x, intersection.y);
            this.updateRealMousePosition();
            this.addIntersection();
        });
        this.mousePosition = new THREE.Vector2(trackIntersections[0].x, trackIntersections[0].y);
        this.updateRealMousePosition();
        this.addIntersection();
    }

    public clear(): void {
        if (this.intersections.length > 1) {
            this.mousePosition = new THREE.Vector2();
            this.intersections = [new THREE.Vector2(0, 0)];
            this.trackClosed = false;
            this.obstacleService.removeAllObstacles();
            this.trackValidationService.clear();
            this.renderService.clear();
        }
    }

    public initialise(container: HTMLElement): void {
        this.container = container;
        this.renderService.initialise(container, this.trackValidationService, this.obstacleService);
        this.obstacleService.initialize(this.intersections);
    }

    public updateMousePosition(clientX: number, clientY: number): void {
        this.mousePosition = this.getRelativeMousePosition(clientX, clientY);
        this.updateRealMousePosition();
    }

    public updateRealMousePosition(): void {
        this.pointMouseHoversOn = this.getPointUnderMouse();
        if (!this.trackClosed) {
            if (this.intersections.length > 1 && this.getXYDistance(this.mousePosition, this.intersections[0]) < 25) {
                this.mousePosition = this.intersections[0];
            }
            this.intersections[this.intersections.length - 1] = this.mousePosition.clone();
            this.trackValidationService.updatePoint(this.intersections.length - 1, this.mousePosition);
            this.renderService.updateIntersectionPosition(this.intersections.length - 1, this.mousePosition);
        } else if (this.currentlyDraggedIntersection !== -1) {
            this.intersections[this.currentlyDraggedIntersection] = this.mousePosition.clone();
            this.trackValidationService.updatePoint(this.currentlyDraggedIntersection, this.mousePosition);
            this.renderService.updateIntersectionPosition(this.currentlyDraggedIntersection, this.mousePosition);
            this.renderService.updateObstaclesPositions(ObstacleType.Booster, this.obstacleService.getObstacles(ObstacleType.Booster));
            this.renderService.updateObstaclesPositions(ObstacleType.Pothole, this.obstacleService.getObstacles(ObstacleType.Pothole));
            this.renderService.updateObstaclesPositions(ObstacleType.Puddle, this.obstacleService.getObstacles(ObstacleType.Puddle));
        }
    }

    private getRelativeMousePosition(clientX: number, clientY: number): THREE.Vector2 {
        const relativePosition = new THREE.Vector2();
        relativePosition.x = clientX - this.container.clientWidth / 2 - this.container.offsetLeft;
        relativePosition.y = this.container.clientHeight / 2 + this.container.offsetTop - clientY;
        return relativePosition;
    }

    private getPointUnderMouse(): number {
        const service = this;
        let index = -1;
        try {
            this.intersections.forEach(function (point, i, array) {
                if (service.getXYDistance(service.mousePosition, point) < 25 && (i !== array.length - 1 || service.trackClosed)) {
                    index = i;
                    throw new Error('To exit the forEach loop');
                }
            });
        } catch (e) { }
        return index;
    }

    private getXYDistance(vector1: THREE.Vector2, vector2: THREE.Vector2): number {
        return Math.sqrt(Math.pow(vector2.x - vector1.x, 2) + Math.pow(vector2.y - vector1.y, 2));
    }

    public addIntersection(): void {
        if (this.pointMouseHoversOn === -1 && !this.trackClosed) {
            this.intersections.push(this.mousePosition.clone());
            this.trackValidationService.addIntersection(this.mousePosition);
            this.renderService.addIntersection(this.mousePosition);

        } else if (this.pointMouseHoversOn === 0 && !this.trackClosed && this.intersections.length > 3) {
            this.trackClosed = true;
            this.intersections.pop();
            this.renderService.closeTrack();
            this.trackValidationService.closeTrack();
        }
    }

    public removeIntersection(): void {
        if (this.intersections.length === 1) {
            return;
        }

        if (this.trackClosed) {
            this.intersections.push(this.mousePosition);
            this.trackValidationService.openTrack(this.mousePosition);
            this.obstacleService.removeAllObstacles();
            this.renderService.openTrack(this.mousePosition);
            this.renderService.updateObstaclesPositions(ObstacleType.Booster, this.obstacleService.getObstacles(ObstacleType.Booster));
            this.renderService.updateObstaclesPositions(ObstacleType.Pothole, this.obstacleService.getObstacles(ObstacleType.Pothole));
            this.renderService.updateObstaclesPositions(ObstacleType.Puddle, this.obstacleService.getObstacles(ObstacleType.Puddle));
            this.trackClosed = false;
            return;
        }

        this.intersections.splice(this.intersections.length - 2, 1);
        this.trackValidationService.removeIntersection(this.mousePosition);
        this.renderService.removeIntersection();
    }

    public startDrag(): void {
        if (this.trackClosed && this.currentlyDraggedIntersection === -1) {
            this.currentlyDraggedIntersection = this.pointMouseHoversOn;
        }
    }

    public endDrag(): void {
        if (this.currentlyDraggedIntersection !== -1) {
            this.currentlyDraggedIntersection = -1;
        }
    }

    public isFinished(): boolean {
        return this.trackClosed && this.trackValidationService.isAllValid();
    }

    public addObstacle(type: number): void {
        if (!this.trackClosed) {
            return;
        }

        this.obstacleService.addObstacle(type);
        this.renderService.updateObstaclesPositions(type, this.obstacleService.getObstacles(type));
    }

    public randomizeAllPositions(type: number): void {
        if (!this.trackClosed) {
            return;
        }

        this.obstacleService.randomizeAllPositions(type);
        this.renderService.updateObstaclesPositions(type, this.obstacleService.getObstacles(type));
    }

    public onResize(): void {
        this.renderService.onResize();
    }

    public saveTrack(name: string, description: string, difficulty: string): Promise<string> {
        const trackToSave = new Track(
            name,
            description,
            difficulty,
            this.intersections.map(intersection => new THREE.Vector2(intersection.x, -intersection.y)),
            this.obstacleService.getObstacles(ObstacleType.Puddle),
            this.obstacleService.getObstacles(ObstacleType.Pothole),
            this.obstacleService.getObstacles(ObstacleType.Booster),
            -1,
            0,
            []
        );

        return this.trackService.save(trackToSave);
    }
}
