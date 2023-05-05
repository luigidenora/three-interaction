import { InstancedInterleavedBuffer, InterleavedBufferAttribute, Vector2, Vector3 } from "three";
import { Line2 as Line2Base } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

//TODO ref
export class Line2 extends Line2Base {
    constructor(material = new LineMaterial()) {
        super(new LineGeometry(), material);

        (this as any).bindEvent("rendererresize", (e: any) => {
            this.material.resolution.set(e.width, e.height);
        });
    }

    public updatePoints(positions: Vector3[], ...indexes: number[]): void {
        const array = (this.geometry.attributes.instanceStart as any).array as Float32Array; //TODO Fix d.ts
        for (const index of indexes) {
            const arrayIndex = (index - 1) * 6 + 3;
            array[arrayIndex] = positions[index].x;
            array[arrayIndex + 1] = positions[index].y;
            array[arrayIndex + 2] = positions[index].z;
            array[arrayIndex + 3] = positions[index].x;
            array[arrayIndex + 4] = positions[index].y;
            array[arrayIndex + 5] = positions[index].z;
        }
        this.geometry.attributes.instanceStart.needsUpdate = true;
        this.geometry.attributes.instanceEnd.needsUpdate = true;
        this.update();
    }

    protected setPoints(positions: Vector3[] | Vector2[]): void {
        if (!this.createAttributes(positions)) {
            this.fillFloat32Array(positions, (this.geometry.attributes.instanceStart as InterleavedBufferAttribute).array as Float32Array);
            this.geometry.attributes.instanceStart.needsUpdate = true;
            this.geometry.attributes.instanceEnd.needsUpdate = true;
        }
        this.update();
    }

    protected createAttributes(positions: Vector3[] | Vector2[]): boolean {
        if (this.geometry.getAttribute("instanceStart")?.count !== positions.length - 1) {
            const array = this.fillFloat32Array(positions);
            const instanceBuffer = new InstancedInterleavedBuffer(array, 6, 1);
            this.geometry.setAttribute('instanceStart', new InterleavedBufferAttribute(instanceBuffer, 3, 0));
            this.geometry.setAttribute('instanceEnd', new InterleavedBufferAttribute(instanceBuffer, 3, 3));
            delete (this.geometry as any)._maxInstanceCount;
            return true;
        }
    }

    protected fillFloat32Array(positions: Vector3[] | Vector2[], target?: Float32Array): Float32Array {
        target ??= new Float32Array(((positions.length - 1) * 3) * 2);
        for (let i = 0; i < positions.length - 1; i++) {
            const index = i * 6;
            target[index] = positions[i].x;
            target[index + 1] = positions[i].y;
            target[index + 2] = (positions[i] as Vector3).z ?? 0;
            target[index + 3] = positions[i + 1].x;
            target[index + 4] = positions[i + 1].y;
            target[index + 5] = (positions[i + 1] as Vector3).z ?? 0;
        }
        return target;
    }

    protected update(): void {
        this.geometry.computeBoundingBox();
        this.geometry.computeBoundingSphere();
        // this.computeLineDistances(); //capire se solo dashed
        // this.needsRender = true;
    }
}
