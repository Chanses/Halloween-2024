import { AnimationAction, AnimationMixer, Mesh, Object3D, PointLight, Scene, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Weapon, WeaponType } from '../Weapons/Weapon';
import { FireZone } from '../Weapons/FireZone/FireZone';
import { Controls } from '../Controls/Controls.ts';
import { ElectricZone } from '../Weapons/ElectricZone/ElectricZone.ts';

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
    private readonly walkAction: AnimationAction | null = null;

    private mixer: AnimationMixer | null = null;

    private readonly animationsMap: Map<string, AnimationAction> = new Map();

    private activeAction: AnimationAction | null = null;

    private readonly group: Mesh = new Mesh();

    private hero: Object3D | null = null;

    private controls: Controls | null = null;

    private readonly weapons: Weapon[] = [];

    public static pos: Vector3 = new Vector3();

    public static stats: HeroStats = InitialStats;

    public constructor(scene: Scene) {
        const loader = new GLTFLoader();
        loader.load('src/models/Soldier.glb', (gltf) => {
            const model = gltf.scene;
            model.traverse((object: any) => {
                if (object.isMesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });
            model.scale.setScalar(2);
            this.hero = model;
            const light = new PointLight('#e4de27', 100);
            light.position.set(0, 5, 0);
            this.group.add(light);
            this.mixer = new AnimationMixer(this.hero);
            gltf.animations.forEach((clip) => {
                const action = this.mixer!.clipAction(clip);
                this.animationsMap.set(clip.name, action);
                if (clip.name === 'Idle') {
                    this.activeAction = action;
                    this.activeAction.play();
                }
            });

            if (this.hero) {
                this.group.add(this.hero);
                scene.add(this.group);
                this.controls = new Controls(this.hero, this.group, this.walkAction);
                this.addWeapon(WeaponType.ElectricZone);
            }
        });
    }

    private handleWeapon(weapon: Weapon) {
        const tw = this.weapons.findIndex((el) => el.type === weapon.type);

        if (tw === -1) {
            this.weapons.push(weapon);
            weapon.setActive();
        }
    }

    public addWeapon(type: WeaponType) {
        switch (type) {
            case WeaponType.FireZone:
                {
                    const weapon = new FireZone(this.group);
                    this.handleWeapon(weapon);
                }
                break;
            case WeaponType.ElectricZone:
                {
                    const weapon = new ElectricZone(this.group);
                    this.handleWeapon(weapon);
                }
                break;
            default:
                break;
        }
    }

    public addHp(hp: number) {
        Hero.stats.hp += hp;
        if (Hero.stats.hp > Hero.stats.maxHp) {
            Hero.stats.hp = Hero.stats.maxHp;
        }
    }

    public addExp(val: number) {
        Hero.stats.exp += val;
    }

    public static getDamage(dmg: number) {
        this.stats.hp -= dmg;
    }

    public die() {}

    public getPosition() {
        return this.group.position;
    }

    private setAnimation(name: string) {
        const newAction = this.animationsMap.get(name);
        if (newAction && this.activeAction !== newAction) {
            this.activeAction?.fadeOut(0.2);
            newAction.reset().fadeIn(0.2).play();
            this.activeAction = newAction;
        }
    }

    public update(delta: number) {
        if (this.controls) {
            this.controls.update(delta);
        }

        const isMoving = this.controls?.isMoving();

        if (this.mixer) {
            this.mixer.update(delta);
        }

        if (isMoving && this.activeAction?.getClip().name !== 'Walk') {
            this.setAnimation('Walk');
        } else if (!isMoving && this.activeAction?.getClip().name !== 'Idle') {
            this.setAnimation('Idle');
        }

        for (const weapon of this.weapons) {
            weapon.updateWeapon(delta);
        }
        if (Hero.stats.hp < 0) {
            this.die();
        }
    }

    public dispose() {
        this.controls?.dispose();
    }
}
