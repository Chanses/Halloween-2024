import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Scene } from 'three';
import { Hero } from '../Hero/Hero';
import { Consumable } from '../Consumable/Consumable.ts';
import { Medkit } from '../Medkit/Medkit.ts';

export interface Enemy {
    mesh: Mesh;
    speed: number;
    damage: number;
    hp: number;
    maxHp: number;
}

export class Enemies {
    private static readonly enemies: Enemy[] = [];

    private static genInt: number = 0;

    private static scene: Scene;

    private static hero: Hero;

    private static consumable: Consumable;

    private static enemySpeed: number = 0.06;

    public static init(scene: Scene, hero: Hero, consumable: Consumable, medkit: Medkit) {
        if (!scene || !hero || !consumable || !medkit) {
            throw new Error('Scene, Hero, and Consumable are required to initialize Enemies.');
        }
        this.scene = scene;
        this.hero = hero;
        this.consumable = consumable;
    }

    public static setSpawnRate(spawnRate: number) {
        if (this.genInt) {
            clearInterval(this.genInt);
        }
        this.genInt = setInterval(() => {
            this.generateEnemy();
        }, spawnRate);
    }

    public static setEnemySpeed(speed: number) {
        this.enemySpeed = speed;
    }

    private static generateEnemy() {
        const dist = 9 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        const heroPos = this.hero.getPosition();
        const x = Math.sin(angle) * dist + heroPos.x;
        const z = Math.cos(angle) * dist + heroPos.z;

        const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ depthWrite: false }));
        mesh.position.set(x, 0, z);
        this.scene.add(mesh);

        const stats: Omit<Enemy, 'mesh'> = {
            speed: this.enemySpeed,
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
            this.scene.remove(enemy.mesh);
            this.enemies.splice(idx, 1);
            this.consumable.dropExpSphere(enemy.mesh.position);
        }
    }

    public static update(delta: number) {
        const heroPos = this.hero.getPosition();
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            const { mesh, hp, maxHp, speed, damage } = enemy;

            mesh.lookAt(heroPos);
            mesh.position.addScaledVector(
                heroPos.clone().sub(mesh.position).normalize(),
                speed * delta,
            );
            (mesh.material as MeshBasicMaterial).color = new Color(1 - hp / maxHp, 0, 0);

            if (hp < 0) {
                this.killEnemy(i);
            } else if (mesh.position.distanceTo(heroPos) < 1) {
                Hero.getDamage(damage);
            }
        }
    }

    public static getEnemies(): Enemy[] {
        return this.enemies;
    }

    public static dispose() {
        clearInterval(this.genInt);
        this.enemies.forEach((enemy) => {
            this.scene.remove(enemy.mesh);
        });
        this.enemies.length = 0;
    }
}
