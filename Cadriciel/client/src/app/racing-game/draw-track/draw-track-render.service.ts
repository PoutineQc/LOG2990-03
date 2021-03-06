import { ObstacleService } from './obstacle.service';
import { Obstacle, ObstacleType } from './obstacle';
import { TrackValidationService } from './track-validation.service';
import { Injectable } from '@angular/core';
import * as THREE from 'three';

import { Settings } from '../settings';

@Injectable()
export class DrawTrackRenderService {

    private container: HTMLElement;

    private trackValidationService: TrackValidationService;

    private obstacleService: ObstacleService;

    private renderer: THREE.WebGLRenderer;

    private camera: THREE.OrthographicCamera;

    private scene: THREE.Scene;

    private intersections: THREE.Mesh[];

    private firstPointHighlight: THREE.Mesh;

    private segments: THREE.Mesh[];

    private potholes: THREE.Mesh[];

    private puddles: THREE.Mesh[];

    private boosters: THREE.Mesh[];

    public trackClosed = false;

    constructor() {
        this.intersections = [];
        this.segments = [];
        this.potholes = this.newObstacles(Settings.POTHOLE_COLOR);
        this.puddles = this.newObstacles(Settings.PUDDLE_COLOR);
        this.boosters = this.newObstacles(Settings.BOOSTER_COLOR);
        this.trackClosed = false;
    }

    public initialise(container: HTMLElement, trackValidationService: TrackValidationService, obstacleService: ObstacleService): void {
        this.container = container;
        this.trackValidationService = trackValidationService;
        this.obstacleService = obstacleService;
        this.createScene();
        this.startRenderingLoop();
    }

    public clear(): void {
        this.intersections = [];
        this.segments = [];
        this.trackClosed = false;
    }

    private createScene(): void {
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(
            this.container.clientWidth / - 2,
            this.container.clientWidth / 2,
            this.container.clientHeight / 2,
            this.container.clientHeight / - 2,
            -Settings.VIEW_DEPTH,
            Settings.VIEW_DEPTH
        );

        this.intersections.push(this.newIntersection(new THREE.Vector2(0, 0)));
        this.segments.push(this.newSegment());
    }

    private startRenderingLoop(): void {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);
        this.render();
    }

    private render(): void {
        requestAnimationFrame(() => this.render());
        this.renderer.render(this.scene, this.camera);
    }

    private newIntersection(position: THREE.Vector2): THREE.Mesh {
        const geometry = new THREE.CircleGeometry(Settings.INTERSECTION_RADIUS, Settings.INTERSECTION_SEGMENTS);
        const material = new THREE.MeshBasicMaterial({ color: Settings.INTERSECTION_COLOR });
        const point = new THREE.Mesh(geometry, material);
        point.position.setX(position.x);
        point.position.setY(position.y);
        point.position.setZ(-3);
        this.scene.add(point);
        return point;
    }

    private newSegment(): THREE.Mesh {
        const geometry = new THREE.PlaneGeometry(Settings.SEGMENT_WIDTH, Settings.SEGMENT_HEIGHT);
        const material = new THREE.MeshBasicMaterial({ color: Settings.SEGMENT_COLOR });
        const segment = new THREE.Mesh(geometry, material);
        segment.position.z = -4;
        return segment;
    }

    private newObstacles(color: number): THREE.Mesh[] {
        const geometry = new THREE.CircleGeometry(Settings.OBSTACLE_RADIUS, Settings.OBSTACLE_SEGMENTS);
        const material = new THREE.MeshBasicMaterial({ color });
        const point = new THREE.Mesh(geometry, material);
        point.position.setZ(1);
        return [point, point.clone(), point.clone(), point.clone(), point.clone()];
    }

    public updateIntersectionPosition(index: number, position: THREE.Vector2): void {
        if (index >= this.intersections.length) {
            return;
        }

        this.intersections[index].position.set(position.x, position.y, this.intersections[index].position.z);
        if (index === 0 && this.trackClosed) {
            this.firstPointHighlight.position.set(position.x, position.y, this.firstPointHighlight.position.z);
        }

        this.updateSegmentPosition(index - 1 > -1 ? index - 1 : this.intersections.length - 1);
        this.updateSegmentPosition(index);

        this.updateSegmentsValidity();
    }

    private updateSegmentPosition(index: number): void {
        const fromPosition = this.intersections[index].position;
        const toPosition = this.intersections[index + 1 < this.intersections.length ? index + 1 : 0].position;

        this.segments[index].geometry = new THREE.PlaneGeometry(this.getXYDistance(fromPosition, toPosition), Settings.SEGMENT_HEIGHT);
        this.segments[index].geometry.rotateZ(Math.atan((toPosition.y - fromPosition.y) / (toPosition.x - fromPosition.x)));
        this.segments[index].position.x = ((toPosition.x - fromPosition.x) / 2) + fromPosition.x;
        this.segments[index].position.y = ((toPosition.y - fromPosition.y) / 2) + fromPosition.y;
    }

    private updateSegmentsValidity(): void {
        this.segments.forEach((segment, index) => {
            segment.material = new THREE.MeshBasicMaterial(
                this.trackValidationService.isValid(index) ? { color: Settings.SEGMENT_COLOR_VALID } : { color: Settings.SEGMENT_COLOR }
            );
        });
    }

    private getXYDistance(vector1: THREE.Vector3, vector2: THREE.Vector3): number {
        return Math.sqrt(Math.pow(vector2.x - vector1.x, 2) + Math.pow(vector2.y - vector1.y, 2));
    }

    public addIntersection(position: THREE.Vector2): void {
        if (this.intersections.length === 1) {
            this.addHighlight(position);
        }

        this.intersections[this.intersections.length - 1].position.setZ(0);
        this.intersections.push(this.newIntersection(position));
        this.segments.splice(this.segments.length - 1, 0, this.newSegment());
        this.scene.add(this.segments[this.segments.length - 2]);
    }

    private addHighlight(position: THREE.Vector2): void {
        const geometry = new THREE.CircleGeometry(Settings.HIGHLIGHT_RADIUS, Settings.HIGHLIGHT_SEGMENTS);
        const material = new THREE.MeshBasicMaterial({ color: Settings.HIGHLIGHT_COLOR });
        this.firstPointHighlight = new THREE.Mesh(geometry, material);
        this.firstPointHighlight.position.set(position.x, position.y, -1);
        this.scene.add(this.firstPointHighlight);
    }

    public removeIntersection(): void {
        this.scene.remove(this.intersections[this.intersections.length - 2]);
        this.intersections.splice(this.intersections.length - 2, 1);
        this.scene.remove(this.segments[this.segments.length - 2]);
        this.segments.splice(this.segments.length - 2, 1);

        if (this.intersections.length === 1) {
            this.scene.remove(this.firstPointHighlight);
        } else {
            this.updateSegmentPosition(this.segments.length - 2);
        }

        this.updateSegmentsValidity();
    }

    public openTrack(position: THREE.Vector2): void {
        this.trackClosed = false;
        this.intersections.push(this.newIntersection(position));
        this.segments.push(this.newSegment());
        this.updateSegmentPosition(this.segments.length - 2);
        this.updateSegmentsValidity();
    }

    public closeTrack(): void {
        this.trackClosed = true;
        this.scene.remove(this.intersections.pop());
        this.segments.pop();
    }

    public updateObstaclesPositions(type: ObstacleType, obstacles: Obstacle[]): void {
        switch (type) {
            case ObstacleType.Booster:
                this.updateObstaclesPositionsInList(obstacles, this.boosters);
                break;

            case ObstacleType.Pothole:
                this.updateObstaclesPositionsInList(obstacles, this.potholes);
                break;

            case ObstacleType.Puddle:
                this.updateObstaclesPositionsInList(obstacles, this.puddles);
                break;

            default:
                break;
        }
    }

    private updateObstaclesPositionsInList(obstacles: Obstacle[], meshList: THREE.Mesh[]): void {
        meshList.forEach((mesh, index) => {
            if (obstacles.length <= index) {
                this.scene.remove(mesh);
            } else {
                const newPosition = this.calculateObstaclePosition(obstacles[index]);
                mesh.position.setX(newPosition.x);
                mesh.position.setY(newPosition.y);
                this.scene.add(mesh);
            }
        });
    }

    private calculateObstaclePosition(obstacle: Obstacle): THREE.Vector2 {
        const point1 = this.intersections[obstacle.segment].position;
        const point2 = this.intersections[obstacle.segment + 1 === this.intersections.length ? 0 : obstacle.segment + 1].position;

        const positionWithoutOffset = this.getPositionWithoutOffset(point1, point2, obstacle.distance);
        const segmentAngle = this.getAngle(point1, point2);
        const offsetAngle = this.getOffsetAngle(segmentAngle, obstacle.offset);

        return new THREE.Vector2(
            positionWithoutOffset.x + (10 * Math.abs(obstacle.offset) * Math.cos(offsetAngle)),
            positionWithoutOffset.y + (10 * Math.abs(obstacle.offset) * Math.sin(offsetAngle))
        );
    }

    public getPositionWithoutOffset(point1: THREE.Vector3, point2: THREE.Vector3, distance: number): THREE.Vector2 {
        const x = ((point2.x - point1.x) * distance) + point1.x;
        const y = ((point2.y - point1.y) * distance) + point1.y;
        return new THREE.Vector2(x, y);
    }

    public getAngle(point1: THREE.Vector3, point2: THREE.Vector3): number {
        const rawAngle = Math.atan((point2.y - point1.y) / (point2.x - point1.x));
        return (point2.x - point1.x >= 0) ? rawAngle : rawAngle + Math.PI;
    }

    public getOffsetAngle(angle: number, offset: number): number {
        return angle + (Math.PI / 2 * (offset > 0 ? 1 : -1));
    }

    public onResize(): void {
        this.camera.left = this.container.clientWidth / -2;
        this.camera.right = this.container.clientWidth / 2;
        this.camera.top = this.container.clientHeight / 2;
        this.camera.bottom = this.container.clientHeight / - 2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}
