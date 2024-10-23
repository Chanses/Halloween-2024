import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { Consumable } from '../Terrain/Consumable';
import { Hero } from '../Hero/Hero';

export interface Enemy {
    mesh: Mesh;
    speed: number;
    damage: number;
    hp: number;
    maxHp: number;
}

export class Enemies {
    private static readonly enemies: Enemy[] = [];

    private static readonly genGap: number = 700;

    private static genInt: number = 0;

    private static scene: Scene;

    private static consumable: Consumable;

    public static init(scene: Scene, consumable: Consumable) {
        this.scene = scene;
        this.generateEnemy = this.generateEnemy.bind(this);
        this.consumable = consumable;
        this.genInt = setInterval(() => {
            this.generateEnemy();
        }, this.genGap);
    }

    private static generateEnemy() {
        // TODO Возможно стоит переделать на генерацию по радиусу от персонажа

        const dist = 25 + Math.random() * 5;
        const angle = (Math.PI / 180) * Math.random() * 360;
        const x = Math.sin(angle) * dist + Hero.pos.x;
        const y = Math.cos(angle) * dist + Hero.pos.z;

        const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ depthWrite: false }));
        mesh.position.set(x, 0, y);
        this.scene.add(mesh);

        const stats: Omit<Enemy, 'mesh'> = {
            speed: 0.06,
            hp: 100,
            damage: 1,
            maxHp: 100,
        };

        this.enemies.push({
            mesh,
            ...stats,
        });
    }

    private static killEnemy(idx: number) {
        const enemy = this.enemies[idx];
        if (enemy) {
            this.consumable.dropExpSphere(enemy.mesh.position);
            this.scene.remove(enemy.mesh);
            this.enemies.splice(idx, 1);
        }
    }

    public static update(delta: number, hPos: Vector3) {
        this.enemies.forEach((enemy, idx) => {
            const { mesh, hp, maxHp, speed, damage } = enemy;

            mesh.lookAt(hPos);
            mesh.position.addScaledVector(
                hPos.clone().sub(mesh.position).normalize(),
                speed * delta,
            );

            (enemy.mesh.material as MeshBasicMaterial).color = new Color(1 - hp / maxHp, 0, 0);

            if (enemy.hp <= 0) {
                this.killEnemy(idx);
            }

            if (enemy.mesh.position.distanceTo(hPos) < 1) {
                Hero.getDamage(damage);
            }
        });
    }

    public static getEnemies(): Enemy[] {
        return this.enemies;
    }

    public static dispose() {
        clearInterval(this.genInt);
    }
}
