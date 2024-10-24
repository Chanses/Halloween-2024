import { DodecahedronGeometry, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { SECTOR_SIZE, SectorProps } from '../Terrain/Terrain';
import { Hero } from '../Hero/Hero';

export enum ConsumableItems {
    AidKit,
    Magnet,
}

export enum Exp {
    Level1 = 20,
    Level2 = 40,
    Level3 = 100,
}

interface ExpSphere {
    mesh: Mesh;
    collected: boolean;
}

export class Consumable {
    private readonly scene: Scene;

    private readonly expLimitBySector: [number, number] = [1, 3];

    private readonly expSpheres: ExpSphere[] = [];

    private readonly hero: Hero;

    private readonly expGeometry: DodecahedronGeometry;

    private readonly expMaterial: MeshBasicMaterial;

    public constructor(scene: Scene, hero: Hero) {
        this.scene = scene;
        this.hero = hero;
        this.expGeometry = new DodecahedronGeometry();
        this.expMaterial = new MeshBasicMaterial({ wireframe: true, color: '#5252d5' });
    }

    public generateExperience(sector: SectorProps): void {
        const [minLimit, maxLimit] = this.expLimitBySector;
        const amount = minLimit + Math.random() * (maxLimit - minLimit);

        for (let i = 0; i < amount; i++) {
            const x = sector.x + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;
            const y = sector.y + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;
            const mesh = new Mesh(this.expGeometry, this.expMaterial);
            mesh.scale.setScalar(0.15);
            mesh.position.set(x, 0, y);
            this.scene.add(mesh);
            this.expSpheres.push({ mesh, collected: false });
        }
    }

    public dropExpSphere(pos: Vector3): void {
        const mesh = new Mesh(this.expGeometry, this.expMaterial);
        mesh.scale.setScalar(0.15);
        mesh.position.copy(pos);
        this.scene.add(mesh);
        this.expSpheres.push({ mesh, collected: false });
    }

    private pickExp(idx: number): void {
        this.hero.addExp(Exp.Level1);
        this.scene.remove(this.expSpheres[idx].mesh);
        this.expSpheres[idx].collected = true;
    }

    public checkPickUp(pos: Vector3): void {
        for (const [idx, expSphere] of this.expSpheres.entries()) {
            if (!expSphere.collected && expSphere.mesh.position.distanceTo(pos) < 1) {
                this.pickExp(idx);
            }
        }
    }
}
