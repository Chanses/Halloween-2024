import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { Weapon, WeaponType } from '../Weapon';
import { Enemies, Enemy } from '../../Enemies/Enemies';
import { Hero } from '../../Hero/Hero';

interface ThrowItemProps {
    mesh: Mesh;
    enemies: Set<Enemy>;
    endPoint: Vector3;
    progress: number;
}

export class Throw extends Weapon {
    protected level: number;

    protected mesh: Mesh;

    private readonly items: ThrowItemProps[] = [];

    public type: WeaponType = WeaponType.Throw;

    private readonly mat: MeshBasicMaterial;

    private readonly geo: BoxGeometry;

    private readonly speed: number = 0.2;

    private readonly attackInterval: number = 0;

    private readonly damage: number = 20;

    private readonly spawnDelay: number = 500;

    public constructor(hero: Mesh) {
        super(hero);

        this.mesh = new Mesh();
        this.level = 0;
        this.mat = new MeshBasicMaterial();
        this.geo = new BoxGeometry();

        this.attackInterval = setInterval(() => {
            this.spawnItem();
        }, this.spawnDelay);
    }

    private getDirectionFromClosestEnemy() {
        const enemies = Enemies.getEnemies();

        if (enemies.length === 0) {
            return null;
        }

        const { pos } = Hero;
        const closestPos = new Vector3();
        let dist = Infinity;

        for (const enemy of enemies) {
            const { position } = enemy.mesh;
            const localDist = pos.distanceToSquared(position);

            if (localDist < dist) {
                dist = localDist;
                closestPos.copy(position);
            }
        }

        return closestPos;
    }

    private spawnItem() {
        const endPoint = this.getDirectionFromClosestEnemy();

        if (endPoint) {
            const item = new Mesh(this.geo, this.mat);

            this.items.push({
                mesh: item,
                enemies: new Set(),
                endPoint,
                progress: 0,
            });

            this.mesh.add(item);
        }
    }

    private destroyItem(idx: number) {
        this.mesh.remove(this.items[idx].mesh);
        this.items.splice(idx, 1);
    }

    public setActive() {
        super.setActive();
    }

    public levelUp() {
        super.levelUp();
    }

    public updateWeapon(_delta: number): void {
        const enemies = Enemies.getEnemies();
        this.items.forEach((item, idx) => {
            const { endPoint, mesh } = item;
            item.progress += this.speed;

            mesh.position.addScaledVector(endPoint.normalize(), this.speed * _delta);

            if (mesh.position.distanceToSquared(new Vector3().setScalar(0)) > 20 ** 2) {
                this.destroyItem(idx);
            }

            for (const enemy of enemies) {
                if (
                    enemy.mesh
                        .localToWorld(new Vector3())
                        .distanceTo(mesh.localToWorld(new Vector3())) < enemy.size &&
                    !item.enemies.has(enemy)
                ) {
                    enemy.hp -= this.damage;
                    item.enemies.add(enemy);
                }
            }
        });
    }

    public dispose() {
        super.dispose();
        clearInterval(this.attackInterval);
    }
}
