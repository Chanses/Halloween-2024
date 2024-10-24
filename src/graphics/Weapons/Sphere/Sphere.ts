import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';
import { Weapon, WeaponType } from '../Weapon';
import { Enemies, Enemy } from '../../Enemies/Enemies';
import { Hero } from '../../Hero/Hero';

export class Sphere extends Weapon {
    public readonly type: WeaponType = WeaponType.Sphere;

    protected readonly mesh: Mesh;

    private readonly rad: number = 3;

    private readonly damage: number = 50;

    protected readonly level: number = 0;

    private readonly speed: number = 0.05;

    private readonly sphereSize: number = 0.4;

    private time: number = 0;

    private readonly hitEnemies: Set<Enemy> = new Set();

    public constructor(hero: Mesh) {
        super(hero);

        const geometry = new SphereGeometry(this.sphereSize, 8, 8);
        const material = new MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new Mesh(geometry, material);
    }

    public setActive() {
        super.setActive();
        this.hitEnemies.clear();
    }

    public levelUp() {
        super.levelUp();
    }

    public updateWeapon(delta: number) {
        this.time += delta;
        const angle = this.time * this.speed;
        const x = Math.cos(angle) * this.rad;
        const y = Math.sin(angle) * this.rad;
        const spinPos = new Vector3(x, 0, y);
        this.mesh.position.copy(spinPos);

        const { pos } = Hero;
        const globalPos = spinPos.add(pos);

        const enemies = Enemies.getEnemies();
        for (const enemy of enemies) {
            const { mesh } = enemy;

            const damageDistance = this.sphereSize + enemy.size / 2;

            if (this.hitEnemies.has(enemy)) {
                if (globalPos.distanceTo(mesh.position) > damageDistance) {
                    this.hitEnemies.delete(enemy);
                }
            } else if (globalPos.distanceTo(mesh.position) < damageDistance) {
                enemy.hp -= this.damage;
                this.hitEnemies.add(enemy);
            }
        }
    }
}
