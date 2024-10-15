import { DodecahedronGeometry, Mesh, MeshBasicMaterial, Scene, Vector2, Vector3 } from 'three';
import { SECTOR_SIZE, SectorProps } from './Terrain';

export enum ConsumableItems {
    AidKit,
    Magnet,
}

export class Consumable {
    private readonly scene: Scene;

    private readonly expLimitBySector: [number, number] = [10, 30];

    private readonly expSpheres: Mesh[] = [];

    public constructor(scene: Scene) {
        this.scene = scene;
    }

    public generateRandom() {}

    public generateExperience(sector: SectorProps) {
        const [minLimit, maxLimit] = this.expLimitBySector;
        const amount = minLimit + Math.random() * (maxLimit - minLimit);

        const geo = new DodecahedronGeometry();
        const mat = new MeshBasicMaterial({ wireframe: true, color: '#5252d5' });
        for (let i = 0; i < amount; i++) {
            const x = sector.x + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;
            const y = sector.y + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;

            const mesh = new Mesh(geo, mat);
            mesh.scale.setScalar(0.15);
            mesh.position.set(x, 0, y);
            this.scene.add(mesh);
            this.expSpheres.push(mesh);
        }
    }

    private pickExp(idx: number) {
        this.scene.remove(this.expSpheres[idx]);
        this.expSpheres.splice(idx, 1);
    }

    public checkPickUp(pos: Vector2) {
        this.expSpheres.forEach((mesh, idx) => {
            if (mesh.position.distanceTo(new Vector3(pos.x, 0, pos.y)) < 1) {
                this.pickExp(idx);
            }
        });
    }
}
