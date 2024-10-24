import { BoxGeometry, Euler, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { Controls } from '../Controls/Controls';
import { Weapon, WeaponType } from '../Weapons/Weapon';
import { FireZone } from '../Weapons/FireZone/FireZone';
import { BackShot } from '../Weapons/BackShot/BackShot';
import { Sphere } from '../Weapons/Sphere/Sphere';

export const LEVELS = [100, 200, 300, 500, 800, 1200, 2000, 4000, 6000, 10000];

export interface HeroStats {
    hp: number;
    maxHp: number;
    speed: number;
    defend: number;
}

export class Hero {
    /**
     * Основная группа для персонажа и оружий
     * @private
     */
    private readonly group: Mesh = new Mesh();

    /**
     * Меш персонажа
     * @private
     */
    private readonly hero: Mesh;

    /**
     * Контролы
     * @private
     */
    private readonly controls: Controls;

    /**
     * Кол-во опыта персонажа
     * @private
     */
    private exp: number = 0;

    /**
     * Активные оружия
     * @private
     */
    private readonly weapons: Weapon[] = [];

    public static pos: Vector3 = new Vector3();

    public static rot: Euler = new Euler();

    public static readonly stats: HeroStats = {
        hp: 100,
        maxHp: 100,
        speed: 0.14,
        defend: 0,
    };

    public constructor(scene: Scene) {
        const geo = new BoxGeometry();
        const mat = new MeshBasicMaterial({ wireframe: false, color: 'green' });

        this.hero = new Mesh(geo, mat);
        this.controls = new Controls(this.hero, this.group);
        this.group.add(this.hero);

        scene.add(this.group);
        this.addWeapon(WeaponType.Sphere);
        this.addWeapon(WeaponType.FireZone);
        this.addWeapon(WeaponType.BackShot);
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
            case WeaponType.FireZone:
                {
                    const weapon = new FireZone(this.group);
                    this.handleWeapon(weapon);
                }
                break;
            case WeaponType.BackShot:
                {
                    const weapon = new BackShot(this.group);
                    this.handleWeapon(weapon);
                }
                break;
            case WeaponType.Sphere:
                {
                    const weapon = new Sphere(this.group);
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
        this.exp += val;
    }

    /**
     * Получить урон
     * @param dmg
     */
    public static getDamage(dmg: number) {
        this.stats.hp -= dmg;
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

        if (Hero.stats.hp < 0) {
            // DEAD
        }
    }

    /**
     * Очищение ресурсов
     */
    public dispose() {
        this.controls.dispose();
        for (const weapon of this.weapons) {
            weapon.dispose();
        }
    }
}
