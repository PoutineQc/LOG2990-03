import { NoModifier } from './drive-modifiers/no-modifier';
import { VehicleRotateEventService, VehicleRotateEvent } from './events/vehicle-rotate-event.service';
import { VehicleMoveEventService, VehicleMoveEvent } from './events/vehicle-move-event.service';
import { ObstacleType } from './draw-track/obstacle';
import { Vector3 } from 'three';
import { Vehicle } from './vehicle';
import { DriveModifier } from './drive-modifiers/drive-modifier';
import { BoosterModifier } from './drive-modifiers/booster-modifier';
import { PotholeModifier } from './drive-modifiers/pothole-modifier';
import { PuddleModifier } from './drive-modifiers/puddle-modifier';
import { Settings } from './settings';

const acceleration = 0.1;
const angularAcceleration = Math.PI * 0.002;
const maxSpeed = 35;
const maxAngularSpeed = Math.PI * 0.01;
const driftAcceleration = -0.8;

export enum MOVE_STATE { MOVE_FORWARD, BRAKE }
export enum TURN_STATE { TURN_LEFT, TURN_RIGHT, DO_NOTHING }

export abstract class Controller {
    protected linearVelocity: Vector3;

    protected angulareVelocity: Vector3;

    protected moveState: MOVE_STATE;

    protected turnState: TURN_STATE;

    private driveModifier: DriveModifier;

    constructor(
        protected vehicleMoveEventService: VehicleMoveEventService,
        protected vehicleRotateEventService: VehicleRotateEventService
    ) {
        this.linearVelocity = new Vector3();
        this.angulareVelocity = new Vector3();
        this.driveModifier = new NoModifier();
        this.moveState = MOVE_STATE.BRAKE;
        this.turnState = TURN_STATE.DO_NOTHING;
    }

    public getSpeed(): Vector3 {
        return this.linearVelocity;
    }

    public getAngularVelocity(): Vector3 {
        return this.angulareVelocity;
    }

    public setLinearVelocity(velocity: Vector3): void {
        this.linearVelocity = velocity;
    }

    public setAngularVelocity(velocity: Vector3): void {
        this.angulareVelocity = velocity;
    }

    public hitWall(speedModifier: number) {
        this.linearVelocity.clampLength(
            0, Math.min(maxSpeed * speedModifier, this.linearVelocity.length() * Settings.WALL_SPEED_DIMINISHER * speedModifier)
        );
    }

    public hitObstacle(type: ObstacleType) {
        switch (type) {
            case ObstacleType.Booster:
                this.driveModifier = new BoosterModifier();
                break;
            case ObstacleType.Pothole:
                this.driveModifier = new PotholeModifier();
                break;
            case ObstacleType.Puddle:
                this.driveModifier = new PuddleModifier();
                break;
        }
    }

    public nextFrame(vehicle: Vehicle) {
        this.modifySpeed(vehicle);
        this.moveVehicle(vehicle);

        this.modifyRotation(vehicle);
        this.rotateVehicle(vehicle);

        if (this.driveModifier.isOver()) {
            this.driveModifier = new NoModifier();
        }
    }

    private modifySpeed(object: Vehicle) {
        if (this.moveState === MOVE_STATE.MOVE_FORWARD) {
            this.linearVelocity.add(new Vector3(
                -acceleration * Math.sin(object.getMesh().rotation.y), 0, -acceleration * Math.cos(object.getMesh().rotation.y)
            ).multiplyScalar(this.driveModifier.getAccelerationMultiplier()));
            this.linearVelocity.clampLength(0, maxSpeed);
        } else {
            this.linearVelocity.clampLength(
                0,
                this.linearVelocity.length() - acceleration * Settings.BRAKE_MULTIPLIER * this.driveModifier.getDecelerationMultiplier()
            );
        }

        const projectOn = new Vector3(
            Math.sin(object.getMesh().rotation.y + Math.PI / 2), 0, Math.cos(object.getMesh().rotation.y + Math.PI / 2));

        const drift = projectOn.clone().multiplyScalar(this.linearVelocity.dot(projectOn) / Math.pow(projectOn.length(), 2));

        this.linearVelocity.add(drift.multiplyScalar(driftAcceleration));

    }

    private moveVehicle(object: Vehicle) {
        const modifiedSpeed = this.driveModifier.getModifiedSpeed(this.linearVelocity);

        const newPosition = new Vector3(
            object.getMesh().position.x + modifiedSpeed.x,
            0,
            object.getMesh().position.z + modifiedSpeed.z
        );

        const moveEvent = new VehicleMoveEvent(object.getMesh().position, newPosition, object);
        this.vehicleMoveEventService.sendVehicleMoveEvent(moveEvent);
        if (!moveEvent.isCancelled()) {
            object.getMesh().position.x = moveEvent.getNewPosition().x;
            object.getMesh().position.y = Settings.TRACK_HEIGHT + this.driveModifier.getVerticalPositionModifier();
            object.getMesh().position.z = moveEvent.getNewPosition().z;
        }
    }

    private modifyRotation(object: Vehicle) {
        if (this.turnState === TURN_STATE.TURN_LEFT) {
            this.angulareVelocity.y = Math.min(maxAngularSpeed, Math.max(
                this.angulareVelocity.y + angularAcceleration, this.angulareVelocity.y * Settings.FRICTION));
        } else if (this.turnState === TURN_STATE.TURN_RIGHT) {
            this.angulareVelocity.y = Math.max(-maxAngularSpeed, Math.min(
                this.angulareVelocity.y - angularAcceleration, this.angulareVelocity.y * Settings.FRICTION));
        } else {
            this.angulareVelocity.y = this.angulareVelocity.y * Settings.FRICTION;
        }
    }

    private rotateVehicle(object: Vehicle) {
        const rotateEvent = new VehicleRotateEvent(
            object.getMesh().rotation.y,
            object.getMesh().rotation.y + this.angulareVelocity.y * this.driveModifier.getRotationMultiplier(),
            object
        );
        this.vehicleRotateEventService.sendVehicleRotateEvent(rotateEvent);
        if (!rotateEvent.isCancelled()) {
            object.getMesh().rotation.y = rotateEvent.getNewRotatiion();
        }
    }
}
