import { BoxGeometry, DirectionalLight, Mesh, MeshLambertMaterial, Scene, Vector3, WebGLRenderer } from "three";
import { computeAutoBinding } from "three-binding";
import Stats from "three/examples/jsm/libs/stats.module";

class Box extends Mesh {
    public activable = true;

    constructor(position) {
        super(new BoxGeometry(0.1, 0.1, 0.1), new MeshLambertMaterial({ color: 0xffffff * Math.random() }));
        this.position.copy(position);
    }
}

class CustomScene extends Scene {
    public camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000).translateZ(10);

    constructor() {
        super();

        this.add(new DirectionalLight(0xffffff, 0.9).translateZ(10),);

        for (let i = 0; i < 10000; i++) {
            this.add(new Box(new Vector3().random().multiplyScalar(500).subScalar(250).setZ(0)));
        }
    }
}

class Main {
    public renderer = new WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas") as HTMLCanvasElement });
    public scene = new CustomScene();
    public eventsManager: EventsManager = new EventsManager(this.renderer);
    public stats = Stats();

    constructor() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        document.body.appendChild(this.stats.dom);
    }

    animate() {
        computeAutoBinding(this.scene);
        this.eventsManager.update(this.scene, this.scene.camera);
        this.renderer.render(this.scene, this.scene.camera);
        this.stats.update();
    }
}

(window as any).main = new Main();