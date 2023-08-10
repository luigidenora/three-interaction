import { BufferGeometry, Color, ColorRepresentation, InstancedMesh as InstancedMeshBase, Material, Matrix4 } from "three";
import { InstancedMeshSingle } from "./InstancedMeshSingle";

export class InstancedMesh2 extends InstancedMeshBase {
    public focusedId: number;
    public hoveredId: number;
    public instances: InstancedMeshSingle[] = [];
    public animate = true;
    /** @internal */ public _tempMatrix = new Matrix4();
    /** @internal */ public _tempColor = new Color();

    constructor(geometry: BufferGeometry, material: Material, count: number, singleInstanceType: typeof InstancedMeshSingle, color?: ColorRepresentation) {
        super(geometry, material, count);
        color = this._tempColor.set(color);

        for (let i = 0; i < count; i++) {
            this.instances.push(new singleInstanceType(this, i, color));
        }

        this.on("pointerintersection", (e) => {
            this.instances[e.intersection.instanceId].__eventsDispatcher.dispatchDOM("pointerintersection", e);
        });

        this.on("animate", (e) => {
            if (!this.animate) return;
            for (let i = 0; i < this.count; i++) {
                this.instances[i].__eventsDispatcher.dispatch("animate", e);
            }
        });
    }
}
