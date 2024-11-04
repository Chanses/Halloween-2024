import { Mesh } from 'three';

export enum WeaponType {
    FireZone,
    ElectricZone,
}

export abstract class Weapon {
    protected readonly hero: Mesh;

    public abstract type: WeaponType;

    protected active: boolean = false;

    protected abstract level: number;

    protected abstract mesh: Mesh;

    protected constructor(hero: Mesh) {
        this.hero = hero;
    }

    public setActive() {
        this.active = true;

        if (this.mesh) {
            this.hero.add(this.mesh);
        } else {
            console.warn('[Weapon] Mesh is not defined');
        }
    }

    public abstract updateWeapon(_delta: number): void;
}
