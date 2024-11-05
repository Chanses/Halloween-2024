import {
    AnimationAction,
    AnimationMixer,
    LoopOnce,
    Mesh,
    Object3D,
    PointLight,
    Scene,
    Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Weapon, WeaponType } from './Weapons/Weapon.ts';
import { Controls } from './Controls/Controls.ts';

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
    speed: 1.5,
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

    public pos: Vector3 = new Vector3();

    public stats: HeroStats = InitialStats;

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

            const fbxLoader = new FBXLoader();
            fbxLoader.load('src/models/DeathAnimation.fbx', (fbx) => {
                fbx.animations.forEach((clip) => {
                    if (clip.name === 'mixamo.com') {
                        const action = this.mixer!.clipAction(clip);
                        this.animationsMap.set(clip.name, action);
                    }
                });
            });

            if (this.hero) {
                this.group.add(this.hero);
                scene.add(this.group);
                this.controls = new Controls(this.hero, this.group, this.walkAction);
                this.initializeWeapons();
            }
        });
    }

    public addHp(hp: number) {
        this.stats.hp += hp;
        if (this.stats.hp > this.stats.maxHp) {
            this.stats.hp = this.stats.maxHp;
        }
    }

    public addExp(val: number) {
        this.stats.exp += val;
    }

    public getDamage(dmg: number) {
        this.stats.hp -= dmg;
    }

    private initializeWeapons() {
        // this.addWeapon(WeaponType.FireZone);
        this.addWeapon(WeaponType.ElectricZone);
    }

    private handleWeapon(type: WeaponType) {
        const existingWeapon = this.weapons.find((weapon) => weapon.type === type);

        if (!existingWeapon) {
            const weapon = new Weapon(type, this.group);
            this.weapons.push(weapon);
            weapon.setActive();
        }
    }

    public addWeapon(type: WeaponType) {
        this.handleWeapon(type);
    }

    public die() {
        if (this.animationsMap.has('mixamo.com')) {
            const deathAction = this.animationsMap.get('mixamo.com');
            if (deathAction) {
                this.setAnimation('mixamo.com');
                deathAction.clampWhenFinished = true;
                deathAction.loop = LoopOnce;
            }
        } else {
            console.error('Death animation not found');
        }
    }

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
            this.pos.copy(this.group.position);
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
        if (this.stats.hp <= 0) {
            this.die();
        }
    }

    public dispose() {
        this.controls?.dispose();
    }
}
