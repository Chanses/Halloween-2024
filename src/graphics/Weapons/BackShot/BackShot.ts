import { CircleGeometry, DoubleSide, Mesh, MeshBasicMaterial } from 'three';
import { Weapon, WeaponType } from '../Weapon';
import { Hero } from '../../Hero/Hero';
import { Enemies } from '../../Enemies/Enemies';
import { degToRad, euclideanModulo, radToDeg } from '../../../helpers/MathUtils';

export class BackShot extends Weapon {
    protected mesh: Mesh;

    public type: WeaponType = WeaponType.BackShot;

    protected level: number = 0;

    private readonly dmg: number = 51;

    public rad: number = 7;

    private readonly THETA: number = 45;

    private readonly attackInterval: number;

    public constructor(hero: Mesh) {
        super(hero);

        const geo = new CircleGeometry(this.rad, 5, 0, degToRad(this.THETA));
        const mat = new MeshBasicMaterial({ side: DoubleSide });
        this.mesh = new Mesh(geo, mat);
        this.updateRotation();

        this.attackInterval = setInterval(() => {
            this.dealDmg();
        }, 1000);
    }

    private dealDmg() {
        const enemies = Enemies.getEnemies();

        for (const enemy of enemies) {
            const { mesh, size } = enemy;
            const { pos, rot } = Hero;
            const inRange = mesh.position.distanceToSquared(pos) < (this.rad + size * 0.5) ** 2;
            const angleToHero = euclideanModulo(
                Math.atan2(mesh.position.x - pos.x, mesh.position.z - pos.z) - rot.y,
                Math.PI * 2,
            );
            const inPie =
                radToDeg(angleToHero) < this.THETA * 0.5 ||
                360 - radToDeg(angleToHero) < this.THETA * 0.5;

            if (inRange && inPie) {
                enemy.hp -= this.dmg;
            }
        }
    }

    private updateRotation() {
        this.mesh.rotation.set(Math.PI / 2, Hero.rot.y + degToRad(this.THETA / 2 - 90), 0, 'YZX');
    }

    public updateWeapon(_delta: number): void {
        this.updateRotation();
    }

    public dispose() {
        clearInterval(this.attackInterval);
    }
}
