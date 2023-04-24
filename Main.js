import { WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, Mesh, MeshLambertMaterial, Vector3, DirectionalLight } from "three";
import { EventsManager } from "./src";
import { computeAutoBinding } from "three-binding";

class Box extends Mesh {
    activable = true;

    constructor(position) {
        super(new BoxGeometry(2, 2, 2), new MeshLambertMaterial({ color: 0xff0000 }));
        this.bindCallback("material", () => this.material.emissive.set(this.active ? 0xff0000 : (this.hovered ? 0x00ff00 : 0x0000ff)));
        this.bindEvent("click", (args) => console.log(args));
        this.position.copy(position);
    }
}

class CustomScene extends Scene {
    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000).translateZ(10);

    constructor() {
        super();
        this.add(
            new DirectionalLight(0xffffff, 0.9).translateZ(10),
            new Box(new Vector3(4)),
            new Box(new Vector3(-4))
        );
    }
}

class Main {

    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas") });
        this.scene = new CustomScene();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.eventsManager = new EventsManager(this.renderer);
    }

    animate() {
        computeAutoBinding(this.scene);
        this.eventsManager.update(this.scene, this.scene.camera);
        this.renderer.render(this.scene, this.scene.camera);
    }
}

window.main = new Main();