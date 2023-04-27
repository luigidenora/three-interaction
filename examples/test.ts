import { BoxGeometry, DirectionalLight, Mesh, MeshLambertMaterial, Scene } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { PerspectiveCamera, WebGLRenderer } from "../src/index";

class Box extends Mesh {
    public override material: MeshLambertMaterial;
    public override activable = true;

    constructor() {
        super(new BoxGeometry(2, 2, 2), new MeshLambertMaterial({ color: 0xaaaaaa * Math.random() }));
        this.position.randomDirection().multiplyScalar(4).setZ(0);
    }
}

class CustomScene extends Scene {
    public camera = new PerspectiveCamera(70, 1, 10000).translateZ(10);

    constructor() {
        super();

        this.add(this.camera, new DirectionalLight(0xffffff, 0.9).translateZ(10));

        for (let i = 0; i < 10; i++) {
            this.add(new Box());
        }

        this.bindEvent(["focus", "blur"], function (e) {
            (e.target as Box).material.emissive.set(e.type == "focus" ? 0xaaaa00 : 0);

            if (e.type == "focus") {
                document.getElementById("menu").innerText += "focus target: " + e.target.id + " / focus relatedTarget: " + e.relatedTarget?.id + "\n";
            }
        });
    }
}

class Main {
    public scene = new CustomScene();
    public renderer = new WebGLRenderer([this.scene], this.animate.bind(this), false, { antialias: true });
    public stats = (Stats as any)();

    constructor() {
        document.body.appendChild(this.stats.dom);
    }

    public animate() {
        this.renderer.render(this.scene, this.scene.camera);
        this.stats.update();
    }
}

(window as any).main = new Main();