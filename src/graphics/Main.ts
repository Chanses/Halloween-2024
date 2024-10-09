import {
    AmbientLight,
    BoxGeometry,
    DirectionalLight,
    Mesh,
    MeshPhongMaterial,
    PCFShadowMap,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    Vector3,
    WebGLRenderer,
} from 'three';
import { FrameHandler } from '../helpers/FrameHandler';
import { Controls } from './Controls/Controls';
import { damp } from '../helpers/MathUtils';

export class Main {
    /**
     * Main Canvas
     * @private
     */
    private readonly canvas: HTMLCanvasElement;

    /**
     * Resize Observer
     * @private
     */
    private readonly resizeObserver: ResizeObserver;

    /**
     * Main buffer
     * @private
     */
    private readonly renderer: WebGLRenderer;

    /**
     * Main camera
     * @private
     */
    private readonly camera: PerspectiveCamera;

    /**
     * Main scene
     * @private
     */
    private readonly scene: Scene;

    private readonly controls: Controls;

    /**
     * Frame handler
     * @private
     */
    private readonly frameHandler: FrameHandler;

    private readonly floor: Mesh;

    private readonly hero: Mesh;

    private readonly dirLight: DirectionalLight;

    private readonly ambLight: AmbientLight;

    private readonly cameraPos: Vector3 = new Vector3();

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
        // this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFShadowMap;

        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.position.set(0, 10, 0);
        this.scene = new Scene();

        this.hero = new Mesh(new BoxGeometry(), new MeshPhongMaterial({ color: 'red' }));
        this.hero.position.y = 0.5;
        this.hero.castShadow = true;
        this.hero.receiveShadow = true;

        this.floor = new Mesh(
            new PlaneGeometry(30, 30),
            new MeshPhongMaterial({ color: '#937474' }),
        );
        this.floor.rotation.x = (Math.PI / 180) * -90;
        this.floor.receiveShadow = true;

        this.dirLight = new DirectionalLight();
        this.dirLight.position.set(50, 50, 50);
        this.dirLight.castShadow = true;

        this.ambLight = new AmbientLight();

        this.scene.add(this.camera, this.floor, this.hero, this.dirLight, this.ambLight);

        this.update = this.update.bind(this);
        this.resize = this.resize.bind(this);
        this.resizeObserver = new ResizeObserver(this.resize);
        this.resizeObserver.observe(this.canvas);
        this.frameHandler = new FrameHandler(this.update);
        this.controls = new Controls(this.hero);
        this.resize();
        this.frameHandler.start();
    }

    /**
     * Update logic
     * @private
     */
    private update(_delta: number) {
        this.render();
        this.controls.updateByControls(_delta);

        // Дает эффект подхода к стене за камерой. Требуются стены -_-
        // this.cameraPos.copy(this.hero.position).add(new Vector3(0, 8, 8));
        // this.camera.position.clamp(this.hero.position, this.cameraPos);

        const cameraLambda = 0.04;
        this.cameraPos.copy(this.hero.position).add(new Vector3(0, 8, 8));
        this.camera.position.set(
            damp(this.camera.position.x, this.cameraPos.x, cameraLambda, _delta),
            damp(this.camera.position.y, this.cameraPos.y, cameraLambda, _delta),
            damp(this.camera.position.z, this.cameraPos.z, cameraLambda, _delta),
        );

        this.camera.lookAt(this.hero.position);
    }

    /**
     * Update render
     * @private
     */
    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Update on resize
     * @private
     */
    private resize() {
        const { width, height } = this.canvas.getBoundingClientRect();
        const dpi = window.devicePixelRatio;
        const w = width * dpi;
        const h = height * dpi;

        this.canvas.width = w;
        this.canvas.height = h;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
    }

    /**
     * Clear
     */
    public dispose() {
        this.resizeObserver.disconnect();
        this.frameHandler.stop();
        this.controls.dispose();
    }
}
