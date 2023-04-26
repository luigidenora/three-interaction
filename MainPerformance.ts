import { BoxGeometry, DirectionalLight, Mesh, MeshLambertMaterial, Scene } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { FullScreenWebGLRenderer, PerspectiveCamera } from "./src/index";

class Box extends Mesh {
    public activable = true;

    constructor() {
        super(new BoxGeometry(0.2, 0.2, 0.2), new MeshLambertMaterial({ color: 0xffffff * Math.random() }));
        (this as any).bindEvent(["focusin", "focusout"], (e) => this.material.emissive.set(e.type == "focusin" ? 0xffff00 : 0));
        (this as any).bindEvent(["mouseenter", "mouseleave"], (e) => !this.active && this.material.emissive.set(e.type == "mouseenter" ? 0xaaaaaa : 0));
        const angleX = Math.random() * Math.PI * 2;
        const angleY = Math.random() * Math.PI * 2;
        (this as any).bindEvent("framerendering", () => {
            const now = performance.now() / 10000;
            this.position.setFromSphericalCoords(5, angleX * now, angleY * now);
            this.lookAt(this.position);
        });
    }
}

class CustomScene extends Scene {
    public camera = new PerspectiveCamera(70, 1, 10000).translateZ(10);

    constructor() {
        super();
        this.add(this.camera, new DirectionalLight(0xffffff, 0.9).translateZ(10)); //import adding camera to scene to trigger renderresize event
        for (let i = 0; i < 1000; i++) {
            this.add(new Box());
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