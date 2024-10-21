import { BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { SECTOR_SIZE, SectorProps } from '../Terrain/Terrain';
import { Consumable } from '../Terrain/Consumable';

export class Enemies {
    private readonly enemies: Mesh[] = [];

    private readonly genGap: number = 700;

    private readonly genInt: number = 0;

    private spawnSectors: SectorProps[] = [];

    private readonly scene: Scene;

    private readonly consumable: Consumable;

    public constructor(scene: Scene, consumable: Consumable) {
        this.scene = scene;
        this.generateEnemy = this.generateEnemy.bind(this);
        this.consumable = consumable;
        this.genInt = setInterval(() => {
            this.generateEnemy();
        }, this.genGap);
    }

    private generateEnemy() {
        // TODO Возможно стоит переделать на генерацию по радиусу от персонажа
        const sIdx = Math.floor(Math.random() * this.spawnSectors.length);
        const { x, y } = this.spawnSectors[sIdx];
        const eX = x + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;
        const eY = y + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;

        const enemy = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color: 'green' }));
        enemy.position.set(eX, 0, eY);
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    private killEnemy(idx: number) {
        const enemy = this.enemies[idx];
        if (enemy) {
            this.consumable.dropExpSphere(enemy.position);
            this.scene.remove(enemy);
            this.enemies.splice(idx, 1);
        }
    }

    public update(delta: number, hPos: Vector3) {
        const enemySpeed = 0.12;
        this.enemies.forEach((enemy, idx) => {
            enemy.lookAt(hPos);
            enemy.position.addScaledVector(
                hPos.clone().sub(enemy.position).normalize(),
                enemySpeed * delta,
            );

            if (enemy.position.distanceTo(hPos) < 2) {
                this.killEnemy(idx);
            }
        });
    }

    public setSectorForSpawn(sectors: SectorProps[]) {
        this.spawnSectors = sectors;
    }

    public dispose() {
        clearInterval(this.genInt);
    }
}
