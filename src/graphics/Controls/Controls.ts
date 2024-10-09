import { AxesHelper, Mesh } from 'three';
import { clamp, damp } from '../../helpers/MathUtils';

enum Direction {
    Top,
    Down,
    Left,
    Right,
    TopRight,
    TopLeft,
    DownRight,
    DownLeft,
}

export class Controls {
    private readonly hero: Mesh;

    private readonly keys: string[] = [];

    private direction: Direction | null = null;

    private pressed: boolean = false;

    private rotation: number = 0;

    private angle: number = 0;

    private tilda: number = 0;

    private readonly DEBUG_DIRECTION: boolean = true;

    public constructor(hero: Mesh) {
        this.hero = hero;

        if (this.DEBUG_DIRECTION) {
            const axesHelper = new AxesHelper();
            this.hero.add(axesHelper);
        }

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener('keydown', this.handleKeyPress);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    private deleteKey(key: string) {
        const idx = this.keys.indexOf(key);

        if (idx !== -1) {
            this.keys.splice(idx, 1);
        }
    }

    private addKey(key: string) {
        const idx = this.keys.indexOf(key);

        if (idx === -1) {
            this.keys.push(key);
        }
    }

    private checkKeyPressed(firstKey: string, secondKey?: string) {
        const isFirst = this.keys.indexOf(firstKey);
        if (!secondKey) {
            return isFirst !== -1;
        }

        const isSecond = this.keys.indexOf(secondKey);

        return isFirst !== -1 && isSecond !== -1;
    }

    private handleKeyUp(e: KeyboardEvent) {
        this.pressed = false;

        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.deleteKey('top');
                break;
            case 'd':
            case 'arrowright':
                this.deleteKey('right');
                break;
            case 'a':
            case 'arrowleft':
                this.deleteKey('left');
                break;
            case 's':
            case 'arrowdown':
                this.deleteKey('down');
                break;
            default:
                break;
        }
    }

    private handleKeyPress(e: KeyboardEvent) {
        this.pressed = true;
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.addKey('top');
                break;
            case 'd':
            case 'arrowright':
                this.addKey('right');
                break;
            case 'a':
            case 'arrowleft':
                this.addKey('left');
                break;
            case 's':
            case 'arrowdown':
                this.addKey('down');
                break;
            default:
                break;
        }

        if (this.keys.length > 2) {
            this.keys.splice(0, 1);
        }

        if (this.keys.length === 1) {
            if (this.checkKeyPressed('top')) {
                this.direction = Direction.Top;
            } else if (this.checkKeyPressed('right')) {
                this.direction = Direction.Right;
            } else if (this.checkKeyPressed('left')) {
                this.direction = Direction.Left;
            } else if (this.checkKeyPressed('down')) {
                this.direction = Direction.Down;
            }
        }

        if (this.keys.length === 2) {
            if (this.checkKeyPressed('top', 'right')) {
                this.direction = Direction.TopRight;
            } else if (this.checkKeyPressed('top', 'left')) {
                this.direction = Direction.TopLeft;
            } else if (this.checkKeyPressed('down', 'left')) {
                this.direction = Direction.DownLeft;
            } else if (this.checkKeyPressed('down', 'right')) {
                this.direction = Direction.DownRight;
            }
        }
    }

    private updateRotation(delta: number) {
        this.rotation = damp(this.rotation, (Math.PI / 180) * this.angle, 0.08, delta);
        this.hero.rotation.y = this.rotation;
    }

    private setAngle(angle: number) {
        // let closestAng = angle;
        //
        // if (this.angle !== angle && Math.abs(this.angle - angle) > 180) {
        //     closestAng = angle - 360;
        // }

        // TODO Нужно посчитать ближайший угол куда доворачивать
        this.angle = angle;
    }

    private updateMovement() {
        const speed = 0.1;

        switch (this.direction) {
            case Direction.Top:
                this.hero.position.z -= this.tilda * speed;
                this.setAngle(0);
                break;
            case Direction.Down:
                this.hero.position.z += this.tilda * speed;
                this.setAngle(-180);
                break;
            case Direction.Right:
                this.hero.position.x += this.tilda * speed;
                this.setAngle(-90);
                break;
            case Direction.Left:
                this.hero.position.x -= this.tilda * speed;
                this.setAngle(-270);
                break;
            case Direction.TopLeft:
                this.hero.position.z -= this.tilda * speed;
                this.hero.position.x -= this.tilda * speed;
                this.setAngle(-315);
                break;
            case Direction.TopRight:
                this.hero.position.z -= this.tilda * speed;
                this.hero.position.x += this.tilda * speed;
                this.setAngle(-45);
                break;
            case Direction.DownRight:
                this.hero.position.z += this.tilda * speed;
                this.hero.position.x += this.tilda * speed;
                this.setAngle(-135);
                break;
            case Direction.DownLeft:
                this.hero.position.z += this.tilda * speed;
                this.hero.position.x -= this.tilda * speed;
                this.setAngle(-225);
                break;
            default:
                break;
        }
    }

    public updateByControls(delta: number) {
        const speed = 0.05;
        if (this.pressed) {
            this.tilda = clamp(this.tilda + delta * speed * 0.5, 0, 1);
        } else {
            this.tilda = clamp(this.tilda - delta * speed, 0, 1);
        }

        this.updateMovement();
        this.updateRotation(delta);
    }

    public dispose() {
        window.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
