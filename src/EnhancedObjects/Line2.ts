import { InstancedInterleavedBuffer, InterleavedBufferAttribute, Vector3 } from "three";
import { Line2 as Line2Base } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

//TODO ref
export class Line2 extends Line2Base {
    constructor(material = new LineMaterial()) {
        super(new LineGeometry(), material);

        (this as any).bindEvent("rendererresize", (e: any) =>  {
            this.material.resolution.set(e.width, e.height);
        });
    }

    public updateGeoPoints(positions: Vector3[], ...indexes: number[]): void {
        if (!this.createAttributes(positions)) {
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
            // this.needsRender = true;
        }
    }

    protected setGeoPoints(positions: Vector3[]): void {
        if (!this.createAttributes(positions)) {
            this.fillPositionsArray(positions, (this.geometry.attributes.instanceStart as any).array as Float32Array); //TODO CAPIRE
            this.geometry.attributes.instanceStart.needsUpdate = true;
            // this.needsRender = true;
        }
    }

    protected createAttributes(positions: Vector3[]): boolean {
        if (!(this.geometry.getAttribute("instanceStart")?.count == positions.length - 1)) {
            if (positions.length > 1) {
                const array = this.fillPositionsArray(positions);
                const instanceBuffer = new InstancedInterleavedBuffer(array, 6, 1);
                this.geometry.setAttribute('instanceStart', new InterleavedBufferAttribute(instanceBuffer, 3, 0));
                this.geometry.setAttribute('instanceEnd', new InterleavedBufferAttribute(instanceBuffer, 3, 3));
                (this.geometry as any)._maxInstanceCount = positions.length;
                // this.needsRender = true;
            }
            return true;
        }
    }

    protected fillPositionsArray(positions: Vector3[], target?: Float32Array): Float32Array {
        target ??= new Float32Array(((positions.length - 1) * 3) * 2);
        for (let i = 0; i < positions.length - 1; i++) {
            const index = i * 6;
            target[index] = positions[i].x;
            target[index + 1] = positions[i].y;
            target[index + 2] = positions[i].z ?? 0;
            target[index + 3] = positions[i + 1].x;
            target[index + 4] = positions[i + 1].y;
            target[index + 5] = positions[i + 1].z ?? 0;
        }
        return target;
    }
}
