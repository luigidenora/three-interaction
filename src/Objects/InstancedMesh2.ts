import { BufferGeometry, Color, InstancedMesh as InstancedMeshBase, Material, Matrix4 } from "three";
import { InstancedMeshSingle } from "./InstancedMeshSingle";

export class InstancedMesh2 extends InstancedMeshBase {
    public focusedId: number;
    public hoveredId: number;
    public instances: InstancedMeshSingle[] = [];
    /** @internal */ public _tempMatrix = new Matrix4();
    /** @internal */ public _tempColor = new Color();
    /** @internal */ public _needsUpdate = false;

    constructor(geometry: BufferGeometry, material: Material, count: number, singleInstanceType: typeof InstancedMeshSingle, color?: Color | number) {
        super(geometry, material, count);

        if (typeof (color) === "number") {
            color = this._tempColor.setHex(color);
        }

        for (let i = 0; i < count; i++) {
            this.instances.push(new singleInstanceType(this, i, color));
        }

        this.on("pointerintersection", (e) => {
            this.instances[e.intersection.instanceId].trigger("pointerintersection", e);
        });

        this.on("animate", (e) => {
            for (let i = 0; i < this.count; i++) { //opt with array sorted and don't include id > count
                this.instances[i].trigger("animate", e);
            }
        });
    }
}
