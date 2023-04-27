import { BoxGeometry, Color, DirectionalLight, DynamicDrawUsage, Matrix4, Mesh, MeshPhongMaterial, Scene, SphereGeometry, Vector3 } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { FullScreenWebGLRenderer, LoadingMaterial, PerspectiveCamera, InstancedMeshEn, InstancedMeshSingle } from "./src/index";

class Spheres extends InstancedMeshEn {
    public activable = true;
    public activatedSpheres = 0;
    public tempPosition = new Vector3();

    constructor() {
        super(new SphereGeometry(0.1, 10, 10), new MeshPhongMaterial(), 5000, Sphere, new Color(0xffffff));
        this.instanceMatrix.setUsage(DynamicDrawUsage);
    }
}

class Sphere extends InstancedMeshSingle {
    public override parent: Spheres;
    protected _red = new Color().setHex(0xff0000);
    protected _white = new Color().setHex(0xffffff);

    constructor(parent: InstancedMeshEn, index: number, color?: Color) {
        super(parent, index, color);
        const angleX = Math.random() * Math.PI * 2;
        const angleY = Math.random() * Math.PI * 2;

        this.bindEvent("framerendering", (e) => {
            const now = performance.now() / 10000;
            this.update(this.parent.tempPosition.setFromSphericalCoords(5, angleX * now, angleY * now));
        });

        this.bindEvent("pointerintersection", (e) => {
            if (this.getColor().equals(this._white)) {
                this.setColor(this._red);
                this.parent.dispatchEvent({ type: "updated", percentage: ++this.parent.activatedSpheres / this.parent.count });
            }
        });
    }
}

class LoadingBar extends Mesh {
    public interceptByRaycaster = false;

    constructor() {
        super(new BoxGeometry(0.2, 10, 1), new LoadingMaterial(10, 0xff0000, 0x00ff00));
        this.position.setX(-10);

        this.bindEvent("animate", () => {
            this.material.uniforms.time.value = performance.now() / 1000;
        });
    }
}

class CustomScene extends Scene {
    public camera = new PerspectiveCamera(70, 1, 10000).translateZ(10);
    public loadingBar = new LoadingBar();
    public spheres = new Spheres();

    constructor() {
        super();

        this.add(this.camera, this.loadingBar, this.spheres, new DirectionalLight(0xffffff, 0.9).translateZ(10)); //import adding camera to scene to trigger renderresize event

        this.spheres.addEventListener("updated", (e) => {
            this.loadingBar.material.setPercentage(e.percentage);
        });
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