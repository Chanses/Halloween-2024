import {
    AmbientLight,
    DirectionalLight,
    FogExp2,
    PCFShadowMap,
    PerspectiveCamera,
    Scene,
    Vector3,
    WebGLRenderer,
} from 'three';
import { FrameHandler } from '../helpers/FrameHandler';
import { damp } from '../helpers/MathUtils';
import { Terrain } from './Terrain/Terrain';
import { Hero } from './Hero/Hero';
import { Timer } from './Timer/Timer';

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

    /**
     * Frame handler
     * @private
     */
    private readonly frameHandler: FrameHandler;

    private readonly hero: Hero;

    private readonly dirLight: DirectionalLight;

    private readonly ambLight: AmbientLight;

    private readonly cameraPos: Vector3 = new Vector3();

    private readonly terrain: Terrain;

    private paused: boolean = false;

    private readonly timer: Timer;

    public constructor(canvas: HTMLCanvasElement, timeEl: HTMLDivElement) {
        this.timer = new Timer(timeEl);
        this.canvas = canvas;
        this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFShadowMap;

        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.position.set(0, 15, 0);
        this.scene = new Scene();
        this.scene.fog = new FogExp2('#ffffff', 0.02);

        this.dirLight = new DirectionalLight();
        this.dirLight.intensity = 2;
        this.dirLight.position.set(-5, 5, 5);
        this.dirLight.castShadow = true;
        const cameraSize = 33;
        this.dirLight.shadow.camera.left = -cameraSize;
        this.dirLight.shadow.camera.right = cameraSize;
        this.dirLight.shadow.camera.top = cameraSize;
        this.dirLight.shadow.camera.bottom = -cameraSize;

        this.ambLight = new AmbientLight();

        this.hero = new Hero(this.scene);

        this.scene.add(this.camera, this.dirLight, this.ambLight, this.dirLight.target);

        this.update = this.update.bind(this);
        this.resize = this.resize.bind(this);
        this.resizeObserver = new ResizeObserver(this.resize);
        this.resizeObserver.observe(this.canvas);
        this.frameHandler = new FrameHandler(this.update);
        this.terrain = new Terrain(this.scene, this.hero);
        this.resize();
        this.frameHandler.start();
    }

    /**
     * Update logic
     * @private
     */
    private update(_delta: number) {
        this.render();
        this.timer.update();
        this.hero.update(_delta);
        this.terrain.update(_delta);
        const { pos } = Hero;

        const cameraLambda = 0.2;
        this.cameraPos.copy(pos).add(new Vector3(0, 16, 8));
        this.camera.position.set(
            damp(this.camera.position.x, this.cameraPos.x, cameraLambda, _delta),
            damp(this.camera.position.y, this.cameraPos.y, cameraLambda, _delta),
            damp(this.camera.position.z, this.cameraPos.z, cameraLambda, _delta),
        );

        this.camera.lookAt(pos);

        this.dirLight.position.copy(pos).add(new Vector3(20, 20, 20));
        // this.dirLight.target.position.copy(pos);
        this.dirLight.target.position.copy(pos);
        // this.dirLight.shadow.camera.updateMatrixWorld(true);
        this.renderer.shadowMap.needsUpdate = true;
        // this.dirLight.updateMatrix();
        // this.dirLight.updateMatrixWorld();
        // this.dirLight.shadow.camera.updateMatrix();
        // this.dirLight.shadow.camera.updateProjectionMatrix();
        // this.dirLight.shadow.camera.updateMatrixWorld();
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

    public togglePause() {
        this.paused = !this.paused;

        if (this.paused) {
            this.frameHandler.stop();
        } else {
            this.timer.updateTimeStart();
            this.frameHandler.start();
        }
    }

    /**
     * Clear
     */
    public dispose() {
        this.resizeObserver.disconnect();
        this.frameHandler.stop();
        this.terrain.dispose();
        this.hero.dispose();
    }
}
