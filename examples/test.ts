import { Mesh, MeshBasicMaterial, Scene, SphereGeometry } from "three";
import { Bind, Main, ManualDetection, OrthographicCamera } from "../src/index";

class Sphere extends Mesh {
    static geometry = new SphereGeometry(1);
    @Bind() get test() { return (window as any).kek === true }
    constructor() {
        super(Sphere.geometry, new MeshBasicMaterial({ color: 0xffff00 }));
    }
}

@ManualDetection()
class SphereManual extends Mesh {
    static geometry = new SphereGeometry(1);
    @Bind() get test() { return (window as any).kek === true }
    constructor() {
        super(Sphere.geometry, new MeshBasicMaterial({ color: 0xffff00 }));
        this.translateX(3);
    }
}

const scene = new Scene().add(
    new Sphere(), new SphereManual(),
    new OrthographicCamera(20).translateZ(10)
);

(window as any).main = new Main({ scenes: [scene] }, { antialias: true });