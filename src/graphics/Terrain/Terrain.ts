import { Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Vector2 } from 'three';
import { Enemies } from '../Enemies/Enemies';
import { Consumable } from '../Consumable/Consumable.ts';
import { Hero } from '../Hero/Hero';

export interface SectorProps {
    x: number;
    y: number;
}

export const SECTOR_SIZE: number = 30.0;

export class Terrain {
    private readonly scene: Scene;

    private readonly sectors: Set<string> = new Set();

    private readonly curSector: Vector2 = new Vector2(0, 0);

    private readonly consumable: Consumable;

    public constructor(scene: Scene, hero: Hero) {
        this.scene = scene;
        this.consumable = new Consumable(scene, hero);
        this.generateSector(0, 0);
    }

    private getSectorKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    private updateCurrentSector(hero: Hero) {
        const { x, z } = hero.getPosition();
        const secX = Math.round(x / SECTOR_SIZE) * SECTOR_SIZE;
        const secY = Math.round(z / SECTOR_SIZE) * SECTOR_SIZE;
        this.curSector.set(secX, secY);
    }

    private generateNearSectors(hero: Hero) {
        this.updateCurrentSector(hero);
        const { x, y } = this.curSector;
        const nearCoords: SectorProps[] = [
            { x: x + SECTOR_SIZE, y },
            { x, y: y + SECTOR_SIZE },
            { x: x + SECTOR_SIZE, y: y + SECTOR_SIZE },
            { x: x + SECTOR_SIZE, y: y - SECTOR_SIZE },
            { x: x - SECTOR_SIZE, y },
            { x, y: y - SECTOR_SIZE },
            { x: x - SECTOR_SIZE, y: y - SECTOR_SIZE },
            { x: x - SECTOR_SIZE, y: y + SECTOR_SIZE },
        ];

        nearCoords.forEach(({ x: nearX, y: nearY }) => {
            this.generateNearSector(nearX, nearY);
        });
    }

    private generateNearSector(x: number, y: number) {
        const key = this.getSectorKey(x, y);
        if (!this.sectors.has(key)) {
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
        this.sectors.add(this.getSectorKey(x, y));
        this.consumable.generateExperience({ x, y });
    }

    public update(_delta: number, hero: Hero) {
        this.generateNearSectors(hero);
        this.consumable.checkPickUp(hero.getPosition());
    }

    public dispose() {
        Enemies.dispose();
    }
}
