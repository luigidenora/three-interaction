import { Mesh, MeshBasicMaterial, Scene as SceneBase, SphereGeometry } from "three";
import { Main, OrthographicCamera } from "../../src/index";

class Scene extends SceneBase {
    constructor() {
        super();
        this.activeSmartRendering();
        this.add(new OrthographicCamera(10).translateZ(10), new Sphere());
    }
}

class Sphere extends Mesh {
    constructor() {
        super(new SphereGeometry(2), new MeshBasicMaterial({ color: 0xff0000 }));
        this.draggable = true;
    }
}

const main = new Main({ scenes: [new Scene()] }, { antialias: true });