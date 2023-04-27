import { BufferGeometry, Color, EventDispatcher, InstancedMesh as InstancedMeshBase, Material, Matrix4, Quaternion, Vector3 } from "three";
import { Events } from "../Events/Events";

export class InstancedMeshSingle extends EventDispatcher {
    public parent: InstancedMesh;
    public index: number;

    constructor(parent: InstancedMesh, index: number, color?: Color) {
        super();
        this.parent = parent;
        this.index = index;
        color && this.setColor(color);
    }

    public bindEvent<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void {
        this.addEventListener(type as any, (e) => listener(e.args));
        return listener;
    }

    public triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void {
        this.dispatchEvent({ type, args });
    }

    public setColor(color: Color): void {
        this.parent.setColorAt(this.index, color);
        this.parent.instanceColor.needsUpdate = true;
    }

    public getColor(color = new Color()): Color {
        this.parent.getColorAt(this.index, color);
        return color;
    }

    public update(position?: Vector3, quaternion?: Quaternion, scale?: Vector3): void {
        const matrix = this.parent._tempMatrix;

        if (position && quaternion && scale) {
            matrix.compose(position, quaternion, scale);
            return;
        }

        let cleared = false;

        if (quaternion) {
            matrix.makeRotationFromQuaternion(quaternion);
            cleared = true;
        }

        if (scale) {
            if (cleared) {
                matrix.scale(scale);
            } else {
                matrix.makeScale(scale.x, scale.y, scale.z);
                cleared = true;
            }
        }

        if (position) {
            if (cleared) {
                matrix.setPosition(position);
            } else {
                matrix.makeTranslation(position.x, position.y, position.z);
                cleared = true;
            }
        }

        this.parent.setMatrixAt(this.index, matrix);
        this.parent._needsUpdate = true;
    }
}


export class InstancedMesh extends InstancedMeshBase {
    public activeId: number;
    // public hoveredId: number;
    /** @internal */ public _tempMatrix = new Matrix4();
    /** @internal */ public _needsUpdate = false;
    public instances: InstancedMeshSingle[] = [];

    constructor(geometry: BufferGeometry, material: Material, count: number, singleInstanceType: typeof InstancedMeshSingle, color?: Color) {
        super(geometry, material, count);

        for (let i = 0; i < count; i++) {
            this.instances.push(new singleInstanceType(this, i, color));
        }

        // this.bindEvent("click", (e) => {
        //     this.activeId = e.intersection.instanceId;
        //     this.instances[this.activeId].dispatchEvent();
        // });

        // this.bindEvent("focusout", (e) => {
        //     this.activeId = undefined;
        // });

        // this.bindEvent("animate", (e) => {
        //     for (let i = 0; i < count; i++) {
        //         this.instances[i].triggerEvent("animate", e); //todo apply cache?
        //     }
        // });

        this.bindEvent("pointerintersection", (e) => {
            this.instances[e.intersection.instanceId].triggerEvent("pointerintersection", e);
        });

        this.bindEvent("framerendering", (e) => {
            for (let i = 0; i < count; i++) {
                this.instances[i].triggerEvent("framerendering", e); //todo apply cache?
            }

            if (this._needsUpdate) {
                this.instanceMatrix.needsUpdate = true;
                this.computeBoundingSphere();
                this._needsUpdate = false;
            }
        });
    }
}
