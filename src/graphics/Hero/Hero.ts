import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from 'three';
import { Controls } from '../Controls/Controls';

export const LEVELS = [100, 200, 300, 500, 800, 1200, 2000, 4000, 6000, 10000];

export class Hero {
    private readonly hero: Mesh;

    private readonly controls: Controls;

    private exp: number = 0;

    public constructor(scene: Scene) {
        const geo = new BoxGeometry();
        const mat = new MeshBasicMaterial({ wireframe: true });

        this.hero = new Mesh(geo, mat);
        this.controls = new Controls(this.hero);

        scene.add(this.hero);
    }

    public addExp(val: number) {
        this.exp += val;
    }

    public getPosition() {
        return this.hero.position;
    }

    public update(delta: number) {
        this.controls.update(delta);
    }

    public dispose() {
        this.controls.dispose();
    }
}
