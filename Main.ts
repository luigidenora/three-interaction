import { BoxGeometry, DirectionalLight, Mesh, MeshLambertMaterial, Scene, Vector3 } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { EventsManager, PerspectiveCamera, FullScreenWebGLRenderer } from "./src/index";

class Box extends Mesh {
    public activable = true;
    
    constructor(position: Vector3) {
        super(new BoxGeometry(0.1, 0.1, 0.1), new MeshLambertMaterial({ color: 0xffffff * Math.random() }));
        this.position.copy(position);
    }
}

class CustomScene extends Scene {
    public camera = new PerspectiveCamera(70, 1, 10000).translateZ(10);
    
    constructor() {
        super(); 
        this.add(this.camera, new DirectionalLight(0xffffff, 0.9).translateZ(10)); //import adding camera to scene to trigger renderresize event
        for (let i = 0; i < 1000; i++) {
            // this.add(new Box(new Vector3().random().multiplyScalar(500).subScalar(250).setZ(0)));
            this.add(new Box(new Vector3().random().multiplyScalar(50).subScalar(25).setZ(0)));
        }
    }
}

class Main {
    public scene = new CustomScene();
    public renderer = new FullScreenWebGLRenderer([this.scene], { antialias: true });
    public eventsManager = new EventsManager(this.renderer, this.scene);ciao
    public stats = Stats();

    constructor() {
        document.body.appendChild(this.stats.dom);
        this.renderer.setAnimationLoop(this.animate.bind(this)); //todo check se serve bind
    }

    public animate() {
        this.eventsManager.update(this.scene, this.scene.camera);
        this.renderer.render(this.scene, this.scene.camera);
        this.stats.update();
    }
}

(window as any).main = new Main();