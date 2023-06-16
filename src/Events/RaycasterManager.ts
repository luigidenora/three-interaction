import { Camera, Object3D, OrthographicCamera, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderTarget, WebGLRenderer } from "three";
import { IntersectionExt } from "./Events";
import { object3DList } from "../Patch/Object3D";

export class RaycasterManager {
    public raycaster = new Raycaster();
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => a.distance - b.distance;
    public raycastGPU = false; //todo capire se ha senso
    private pickingTexture = new WebGLRenderTarget(1, 1); // todo move
    private pointer = new Vector2();
    private pointerNormalized = new Vector2();

    constructor(public renderer: WebGLRenderer) { }

    public getIntersections(scene: Scene, camera: Camera, event: PointerEvent, isDragging: boolean, findDropTarget: boolean): IntersectionExt[] {
        const intersections: IntersectionExt[] = [];
        this.updateCanvasPointerPosition(event);
        this.raycaster.setFromCamera(this.pointerNormalized, camera);
        if (isDragging) {
            if (findDropTarget) {
                this.raycastGPU ? this.raycastObjectsGPU(scene, camera as any, intersections) : this.raycastObjectsDropTarget(scene, intersections);
            }
        } else {
            this.raycastGPU ? this.raycastObjectsGPU(scene, camera as any, intersections) : this.raycastObjects(scene, intersections);
        }
        intersections.sort(this.intersectionSortComparer);
        return intersections;
    }

    private updateCanvasPointerPosition(event: PointerEvent): void {
        this.pointerNormalized.x = event.offsetX / this.renderer.domElement.clientWidth * 2 - 1;
        this.pointerNormalized.y = event.offsetY / this.renderer.domElement.clientHeight * -2 + 1;
        this.pointer.set(event.offsetX, event.offsetY);
    }

    private raycastObjects(object: Object3D, target: IntersectionExt[] = []): IntersectionExt[] {
        if (object.interceptByRaycaster && object.visible) {

            for (const obj of object.children) {
                this.raycastObjects(obj, target);
            }

            let previousCount = target.length;

            if (object.objectsToRaycast) {
                this.raycaster.intersectObjects(object.objectsToRaycast, false, target);
            } else {
                this.raycaster.intersectObject(object, false, target);
            }

            while (target.length > previousCount) {
                const intersection = target[previousCount];
                intersection.hitbox = intersection.object;
                intersection.object = object;
                previousCount++;
            }
        }

        return target;
    }

    private raycastObjectsDropTarget(scene: Scene, target: IntersectionExt[] = []): IntersectionExt[] {
        for (const object of scene.__dropTargets.data) {
            if (/* object.interceptByRaycaster &&  */object.visible) {

                // for (const obj of object.children) {
                //     this.raycastObjectsDropTarget(obj, target);
                // }

                let previousCount = target.length;

                if (object.objectsToRaycast) {
                    this.raycaster.intersectObjects(object.objectsToRaycast, false, target);
                } else {
                    this.raycaster.intersectObject(object, false, target);
                }

                while (target.length > previousCount) {
                    const intersection = target[previousCount];
                    intersection.hitbox = intersection.object;
                    intersection.object = object;
                    previousCount++;
                }
            }
        }

        return target;
    }

    private raycastObjectsGPU(scene: Scene, camera: PerspectiveCamera | OrthographicCamera, target: IntersectionExt[] = []): IntersectionExt[] {
        const width = this.renderer.domElement.width;
        const height = this.renderer.domElement.height;
        camera.setViewOffset(width, height, this.pointer.x * devicePixelRatio, this.pointer.y * devicePixelRatio, 1, 1);
        this.renderer.setRenderTarget(this.pickingTexture);
        this.renderer.render(scene, camera);
        camera.clearViewOffset();
        const pixelBuffer = new Uint8Array(4);
        this.renderer.readRenderTargetPixels(this.pickingTexture, 0, 0, 1, 1, pixelBuffer);
        const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
        this.renderer.setRenderTarget(null);
        const object = object3DList[id];

        if (object) {
            if (object.objectsToRaycast) {
                this.raycaster.intersectObjects(object.objectsToRaycast, false, target);
            } else {
                this.raycaster.intersectObject(object, false, target);
            }

            for (const intersection of target) {
                intersection.hitbox = intersection.object;
                intersection.object = object;
            }
        }

        return target;
    }
}
