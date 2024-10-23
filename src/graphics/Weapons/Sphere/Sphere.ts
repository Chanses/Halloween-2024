import { SphereGeometry, Mesh, MeshBasicMaterial } from 'three';
import { Weapon, WeaponType } from '../Weapon';
import { Enemies, Enemy } from '../../Enemies/Enemies';

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

        this.mesh.position.y = 1;
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
        this.mesh.position.x = Math.cos(angle) * this.rad;
        this.mesh.position.z = Math.sin(angle) * this.rad;

        // FIXME: уверен как нормально вычислять реальную позицию сферы
        const pos = new Mesh();
        pos.position.x = this.mesh.position.x + this.hero.position.x;
        pos.position.z = this.mesh.position.z + this.hero.position.z;

        const enemies = Enemies.getEnemies();

        for (const enemy of enemies) {
            const { mesh } = enemy;

            // FIXME: надо вычислять это не так
            const damageDistance = this.sphereSize * 3;

            if (this.hitEnemies.has(enemy)) {
                if (pos.position.distanceTo(mesh.position) > damageDistance) {
                    this.hitEnemies.delete(enemy);
                }
            } else if (pos.position.distanceTo(mesh.position) < damageDistance) {
                enemy.hp -= this.damage;
                this.hitEnemies.add(enemy);
            }
        }
    }
}
