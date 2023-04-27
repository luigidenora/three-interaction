import { BoxGeometry, DirectionalLight, Mesh, MeshLambertMaterial, Scene } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { FullScreenWebGLRenderer, PerspectiveCamera } from "./src/index";

class Box extends Mesh {
    public activable = true;
    public override material: MeshLambertMaterial;

    constructor() {
        super(new BoxGeometry(2, 2, 2), new MeshLambertMaterial({ color: 0xaaaaaa * Math.random() }));
        this.bindEvent(["focusin", "focusout"], (e) => this.material.emissive.set(e.type == "focusin" ? 0xffff00 : 0));
    }
}

class CustomScene extends Scene {
    public camera = new PerspectiveCamera(70, 1, 10000).translateZ(10);

    constructor() {
        super();
        this.add(this.camera, new DirectionalLight(0xffffff, 0.9).translateZ(10)); //import adding camera to scene to trigger renderresize event
        for (let i = 0; i < 10; i++) {
            this.add(new Box().translateX(Math.random() * 10 - 5).translateY(Math.random() * 10 - 5));
        }
    }
}

class Main {
    public scene = new CustomScene();
    public renderer = new FullScreenWebGLRenderer([this.scene], this.animate.bind(this), { antialias: true });
    public stats = Stats();

    constructor() {
        document.body.appendChild(this.stats.dom);
    }

    public animate() {
        this.renderer.render(this.scene, this.scene.camera);
        this.stats.update();
    }
}

(window as any).main = new Main();