import { Scene, PerspectiveCamera, Object3D, Vector3 } from 'three';

const WEIGHT = 300;
const HEIGHT = 150;
const ORIGIN_X = 400;
const ORIGIN_Y = 0;
const FAR = 3000;
const NEAR = 0.1;
const FOV = 45;
const POSITION_CAMERA = new Vector3(0, 1, 2);

export class RearView {
    private scene: Scene;
    private rearCamera: PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    constructor(scene: Scene, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.rearCamera = new PerspectiveCamera(FOV, innerWidth / innerHeight, NEAR, FAR);
        this.renderer = renderer;
    }

    public addRearView(vehicle: any): void {
        const target = new Object3D;
        vehicle.add(target);
        target.position.set(0, 0, FAR);
        vehicle.add(this.rearCamera);

        this.rearCamera.position.set(POSITION_CAMERA.x, POSITION_CAMERA.y, POSITION_CAMERA.z);
        this.rearCamera.lookAt(target.position);

        this.renderer.setViewport(ORIGIN_X, ORIGIN_Y, WEIGHT, HEIGHT);
        this.renderer.setScissor(ORIGIN_X, ORIGIN_Y, WEIGHT, HEIGHT);
        this.renderer.setScissorTest(true);
        this.renderer.render(this.scene, this.rearCamera);

    }


}
