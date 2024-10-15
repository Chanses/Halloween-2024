import { BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector2, Vector3 } from 'three';
import { SECTOR_SIZE, SectorProps } from '../Terrain/Terrain';

export class Enemies {
    private readonly enemies: Mesh[] = [];

    private readonly genGap: number = 700;

    private readonly genInt: number = 0;

    private spawnSectors: SectorProps[] = [];

    private readonly scene: Scene;

    public constructor(scene: Scene) {
        this.scene = scene;
        this.generateEnemy = this.generateEnemy.bind(this);
        this.genInt = setInterval(() => {
            this.generateEnemy();
        }, this.genGap);
    }

    private generateEnemy() {
        const sIdx = Math.floor(Math.random() * this.spawnSectors.length);
        const { x, y } = this.spawnSectors[sIdx];
        const eX = x + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;
        const eY = y + Math.random() * SECTOR_SIZE - SECTOR_SIZE * 0.5;

        const enemy = new Mesh(
            new BoxGeometry(),
            new MeshBasicMaterial({ color: 'green', wireframe: true }),
        );
        enemy.position.set(eX, 0, eY);
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    private killEnemy(idx: number) {
        const enemy = this.enemies[idx];
        this.scene.remove(enemy);
        this.enemies.splice(idx, 1);
    }

    public update(delta: number, hPos: Vector2) {
        this.enemies.forEach((enemy, idx) => {
            enemy.lookAt(new Vector3(hPos.x, 0, hPos.y));
            const closePos = enemy.position.lerp(new Vector3(hPos.x, 0, hPos.y), 0.01 * delta);
            enemy.position.copy(closePos);

            if (enemy.position.distanceTo(new Vector3(hPos.x, 0, hPos.y)) < 2) {
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
