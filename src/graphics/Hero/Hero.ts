import { BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { Controls } from '../Controls/Controls';
import { Weapon, WeaponType } from '../Weapons/Weapon';
import { FireZone } from '../Weapons/FireZone/FireZone';
import { ElectricZone } from '../Weapons/ElectricZone/ElectricZone.ts';

export const LEVELS = [100, 200, 300, 500, 800, 1200, 2000, 4000, 6000, 10000];

export interface HeroStats {
    hp: number;
    maxHp: number;
    speed: number;
    defend: number;
    exp: number;
}

export const InitialStats: HeroStats = {
    hp: 100,
    maxHp: 100,
    speed: 0.5,
    defend: 0,
    exp: 0,
};

export class Hero {
    private readonly group: Mesh = new Mesh();

    private readonly hero: Mesh;

    private readonly controls: Controls;

    private readonly weapons: Weapon[] = [];

    public static pos: Vector3 = new Vector3();

    public static stats: HeroStats = InitialStats;

    public constructor(scene: Scene) {
        const geo = new BoxGeometry();
        const mat = new MeshBasicMaterial({ wireframe: false, color: 'green' });

        this.hero = new Mesh(geo, mat);
        this.controls = new Controls(this.hero, this.group);
        this.group.add(this.hero);

        scene.add(this.group);
        this.addWeapon(WeaponType.FireZone);
    }

    /**
     * Проверка на уникальность оружия
     * @param weapon
     * @private
     */
    private handleWeapon(weapon: Weapon) {
        const tw = this.weapons.findIndex((el) => el.type === weapon.type);

        if (tw === -1) {
            this.weapons.push(weapon);
            weapon.setActive();
        }
    }

    /**
     * Добавление нового оружия
     * @param type
     */
    public addWeapon(type: WeaponType) {
        switch (type) {
            case WeaponType.ElectricZone:
                {
                    const weapon = new ElectricZone(this.group);
                    this.handleWeapon(weapon);
                }
                break;
            case WeaponType.FireZone:
                {
                    const weapon = new FireZone(this.group);
                    this.handleWeapon(weapon);
                }
                break;
            default:
                break;
        }
    }

    /**
     * Добаление опыта опыта
     * @param val
     */
    public addExp(val: number) {
        Hero.stats.exp += val;
    }

    /**
     * Получить урон
     * @param dmg
     */
    public static getDamage(dmg: number) {
        this.stats.hp -= dmg;
    }

    public die() {
        (this.hero.material as MeshBasicMaterial).color.set('magenta');
    }

    /**
     * Получение позиции
     */
    public getPosition() {
        return this.group.position;
    }

    /**
     * Обновление персонажа и оружий
     * @param delta
     */
    public update(delta: number) {
        this.controls.update(delta);

        for (const weapon of this.weapons) {
            weapon.updateWeapon(delta);
        }

        console.debug(Hero.stats.exp);

        if (Hero.stats.hp < 0) {
            this.die();
        }
    }

    /**
     * Очищение ресурсов
     */
    public dispose() {
        this.controls.dispose();
    }
}
