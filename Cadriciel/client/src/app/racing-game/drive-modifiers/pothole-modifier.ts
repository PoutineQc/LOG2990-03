import { Vector3 } from 'three';
import { DriveModifier } from './drive-modifier';
import { Settings } from '../settings';

export class PotholeModifier extends DriveModifier {
    public getModifiedSpeed(speed: Vector3): Vector3 {
        return speed.clone().clampLength(0, Math.max(0.5, speed.length()));
    }

    public getVerticalPositionModifier() {
        return Math.random() * Settings.SCENE_SCALE;
    }

    public getAccelerationMultiplier() {
        return Settings.DRIVE_MODIFIER_POTHOLE_ACCELERATION;
    }

    public getDecelerationMultiplier() {
        return Settings.DRIVE_MODIFIER_POTHOLE_DECELERATION;
    }

    public getRotationMultiplier() {
        return Settings.DRIVE_MODIFIER_POTHOLE_ROTATION;
    }

    protected getTotalTime() {
        return Settings.DRIVE_MODIFIER_POTHOLE_TIME;
    }
}
