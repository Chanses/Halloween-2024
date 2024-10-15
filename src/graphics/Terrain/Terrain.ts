import { Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Vector2 } from 'three';
import { Enemies } from '../Enemies/Enemies';
import { Consumable } from './Consumable';

export interface SectorProps {
    x: number;
    y: number;
}
export const SECTOR_SIZE: number = 50.0;

export class Terrain {
    private readonly scene: Scene;

    private readonly sectors: Set<SectorProps> = new Set();

    private pos: Vector2 = new Vector2(0, 0);

    private readonly curSector: Vector2 = new Vector2(0, 0);

    private readonly enemies: Enemies;

    private readonly consumable: Consumable;

    public constructor(scene: Scene) {
        this.scene = scene;
        this.consumable = new Consumable(scene);
        this.enemies = new Enemies(scene);
        this.generateSector(0, 0);
    }

    private updateCurrentSector() {
        const { x, y } = this.pos;
        const secX = Math.round(x / SECTOR_SIZE) * SECTOR_SIZE;
        const secY = Math.round(y / SECTOR_SIZE) * SECTOR_SIZE;
        this.curSector.set(secX, secY);
    }

    private generateNearSectors() {
        const { x, y } = this.curSector;

        const nearCoords: SectorProps[] = [
            {
                x: x + SECTOR_SIZE,
                y,
            },
            {
                x,
                y: y + SECTOR_SIZE,
            },
            {
                x: x + SECTOR_SIZE,
                y: y + SECTOR_SIZE,
            },
            {
                x: x + SECTOR_SIZE,
                y: y - SECTOR_SIZE,
            },
            {
                x: x - SECTOR_SIZE,
                y,
            },
            {
                x,
                y: y - SECTOR_SIZE,
            },
            {
                x: x - SECTOR_SIZE,
                y: y - SECTOR_SIZE,
            },
            {
                x: x - SECTOR_SIZE,
                y: y + SECTOR_SIZE,
            },
        ];

        for (const nearCoord of nearCoords) {
            const nX = nearCoord.x;
            const nY = nearCoord.y;
            this.generateNearSector(nX, nY);
        }

        this.enemies.setSectorForSpawn(nearCoords);
    }

    private generateNearSector(x: number, y: number) {
        let isExist = false;
        for (const sector of this.sectors) {
            if (x === sector.x && y === sector.y) {
                isExist = true;
            }
        }

        if (!isExist) {
            this.generateSector(x, y);
        }
    }

    private generateSector(x: number, y: number) {
        const sector = new Mesh(
            new PlaneGeometry(SECTOR_SIZE, SECTOR_SIZE),
            new MeshBasicMaterial({ wireframe: true }),
        );
        sector.position.set(x, 0, y);
        sector.rotation.x = Math.PI * 0.5;
        this.scene.add(sector);
        this.sectors.add({ x, y });
        this.consumable.generateExperience({ x, y });
    }

    public setHeroPosition(pos: Vector2) {
        this.pos = pos;
    }

    public update(delta: number) {
        this.updateCurrentSector();
        this.generateNearSectors();
        this.enemies.update(delta, this.pos);
        this.consumable.checkPickUp(this.pos);
    }

    public dispose() {
        this.enemies.dispose();
    }
}
