import {
    BufferGeometry,
    InstancedMesh,
    Material,
    Matrix4,
    Mesh,
    MeshPhongMaterial,
    NearestFilter,
    PlaneGeometry,
    Scene,
    TextureLoader,
    Vector2,
    Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Enemies } from '../Enemies/Enemies';
import { Consumable } from './Consumable';
import { Hero } from '../Hero/Hero';
import sectorTex from './assets/sector.png';
import modelGlb from './assets/terrain.glb?url';

export interface SectorProps {
    x: number;
    y: number;
}

interface AssetProps {
    geometry: BufferGeometry;
    material: Material;
    name: string;
    positions: Vector3[];
    instance: InstancedMesh;
    genChance: number;
    maxByChunk: number;
}

export const SECTOR_SIZE: number = 30.0;

export class Terrain {
    private readonly scene: Scene;

    private readonly sectors: Set<SectorProps> = new Set();

    private readonly curSector: Vector2 = new Vector2(0, 0);

    private readonly consumable: Consumable;

    private readonly grassInstance: InstancedMesh | null = null;

    private sectorMat: MeshPhongMaterial | null = null;

    private readonly assets: AssetProps[] = [];

    public constructor(scene: Scene, hero: Hero) {
        this.scene = scene;
        this.consumable = new Consumable(scene, hero);

        this.loadAssets().then(() => {
            Enemies.init(scene, this.consumable);
            this.generateSector(0, 0);
        });
    }

    private async loadAssets() {
        const loader = new GLTFLoader();
        const textLoader = new TextureLoader();
        const mainModel = (await loader.loadAsync(modelGlb)).scene;
        const meshesToIgnore = ['scene', 'fountain', 'bird'];
        mainModel.traverse((el) => {
            const mesh = el as Mesh;
            const { material, geometry, name } = mesh;
            const ignore = meshesToIgnore.some((n) => name.toLowerCase().includes(n.toLowerCase()));

            if (!ignore) {
                const asset: AssetProps = {
                    material: material as Material,
                    geometry,
                    name,
                    positions: [],
                    instance: new InstancedMesh(geometry, material, 0),
                    genChance: 0.01,
                    maxByChunk: 0,
                };

                mesh.geometry.computeBoundingBox();
                const setConfig = (scale: number, chance: number, maxAmount: number) => {
                    asset.geometry.scale(scale, scale, scale);
                    asset.genChance = chance;
                    asset.maxByChunk = maxAmount;
                };

                switch (name.toLowerCase()) {
                    case 'tree':
                        setConfig(1.4, 0.1, 16);
                        break;
                    case 'tree_large':
                        setConfig(2, 0.1, 8);
                        break;
                    case 'bush':
                        setConfig(2, 0.1, 15);
                        break;
                    case 'grass_b':
                        setConfig(0.9, 0.2, 15);
                        break;
                    case 'cobble_stones':
                        setConfig(1, 0.05, 15);
                        break;
                    case 'cobble_stones_large':
                        setConfig(1, 0.05, 27);
                        break;
                    case 'bird':
                        setConfig(5, 0.05, 27);
                        break;
                    default:
                        break;
                }

                this.assets.push(asset);
            }
        });

        // Сектор
        const sectorTexture = await textLoader.loadAsync(sectorTex);
        sectorTexture.magFilter = NearestFilter;
        sectorTexture.minFilter = NearestFilter;
        this.sectorMat = new MeshPhongMaterial({ map: sectorTexture });
    }

    private updateCurrentSector() {
        const { x, z } = Hero.pos;
        const secX = Math.round(x / SECTOR_SIZE) * SECTOR_SIZE;
        const secY = Math.round(z / SECTOR_SIZE) * SECTOR_SIZE;
        this.curSector.set(secX, secY);
    }

    private generateNearSectors() {
        const { x, y } = this.curSector;

        const nearCoords: SectorProps[] = [
            {
                x: x + SECTOR_SIZE,
                y,
            },
            {
                x,
                y: y + SECTOR_SIZE,
            },
            {
                x: x + SECTOR_SIZE,
                y: y + SECTOR_SIZE,
            },
            {
                x: x + SECTOR_SIZE,
                y: y - SECTOR_SIZE,
            },
            {
                x: x - SECTOR_SIZE,
                y,
            },
            {
                x,
                y: y - SECTOR_SIZE,
            },
            {
                x: x - SECTOR_SIZE,
                y: y - SECTOR_SIZE,
            },
            {
                x: x - SECTOR_SIZE,
                y: y + SECTOR_SIZE,
            },
        ];

        for (const nearCoord of nearCoords) {
            const nX = nearCoord.x;
            const nY = nearCoord.y;
            this.generateNearSector(nX, nY);
        }
    }

    private generateNearSector(x: number, y: number) {
        let isExist = false;
        for (const sector of this.sectors) {
            if (x === sector.x && y === sector.y) {
                isExist = true;
            }
        }

        if (!isExist) {
            this.generateSector(x, y);
        }
    }

    private generateSurroundings(x: number, y: number) {
        for (const asset of this.assets) {
            const beforeAmount = asset.positions.length;

            for (let i = 0; i < asset.maxByChunk; i++) {
                const needToGenerate = asset.genChance * 100 > Math.random() * 100;

                if (needToGenerate) {
                    const pos = new Vector3();
                    const ax = -SECTOR_SIZE * 0.5 + Math.random() * SECTOR_SIZE + x;
                    const ay = -SECTOR_SIZE * 0.5 + Math.random() * SECTOR_SIZE + y;
                    pos.set(ax, -0.5, ay);
                    asset.positions.push(pos);
                    this.scene.remove(asset.instance);
                    asset.instance = new InstancedMesh(
                        asset.geometry,
                        asset.material,
                        asset.positions.length,
                    );

                    asset.instance.castShadow = true;
                    asset.instance.receiveShadow = true;
                }
            }

            if (beforeAmount !== asset.positions.length) {
                this.scene.add(asset.instance);
            }
        }
    }

    private generateSector(x: number, y: number) {
        if (this.sectorMat) {
            const sector = new Mesh(new PlaneGeometry(SECTOR_SIZE, SECTOR_SIZE), this.sectorMat);
            sector.position.set(x, -0.5, y);
            sector.rotation.x = -Math.PI * 0.5;
            sector.receiveShadow = true;
            this.scene.add(sector);
            this.sectors.add({ x, y });
            // this.consumable.generateExperience({ x, y });
            this.generateSurroundings(x, y);
        }
    }

    public update(delta: number) {
        if (this.sectorMat) {
            this.generateNearSectors();
        }

        this.updateCurrentSector();
        Enemies.update(delta);
        this.consumable.checkPickUp();

        for (const asset of this.assets) {
            for (let i = 0; i < asset.positions.length; i++) {
                asset.instance.setMatrixAt(i, new Matrix4().makeTranslation(asset.positions[i]));
            }
        }

        if (this.grassInstance) {
            this.grassInstance.instanceMatrix.needsUpdate = true;
            this.grassInstance.computeBoundingSphere();
        }
    }

    public dispose() {
        Enemies.dispose();
    }
}
