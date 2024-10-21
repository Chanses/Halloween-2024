import { Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Vector2, Vector3 } from 'three';
import { Enemies } from '../Enemies/Enemies';
import { Consumable } from './Consumable';
import { Hero } from '../Hero/Hero';

export interface SectorProps {
    x: number;
    y: number;
}
export const SECTOR_SIZE: number = 40.0;

export class Terrain {
    private readonly scene: Scene;

    private readonly sectors: Set<SectorProps> = new Set();

    private pos: Vector3 = new Vector3();

    private readonly curSector: Vector2 = new Vector2(0, 0);

    private readonly enemies: Enemies;

    private readonly consumable: Consumable;

    public constructor(scene: Scene, hero: Hero) {
        this.scene = scene;
        this.consumable = new Consumable(scene, hero);
        this.enemies = new Enemies(scene, this.consumable);
        // this.hero

        this.generateSector(0, 0);
    }

    private updateCurrentSector() {
        const { x, z } = this.pos;
        const secX = Math.round(x / SECTOR_SIZE) * SECTOR_SIZE;
        const secY = Math.round(z / SECTOR_SIZE) * SECTOR_SIZE;
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

    public setHeroPosition(pos: Vector3) {
        this.pos = pos;
    }

    public update(delta: number) {
        this.updateCurrentSector();
        this.generateNearSectors();
        this.enemies.update(delta, this.pos);
        this.consumable.checkPickUp(this.pos);
        // this.hero.update
    }

    public dispose() {
        this.enemies.dispose();
    }
}
