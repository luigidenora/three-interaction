import { Color, DirectionalLight, DynamicDrawUsage, InstancedMesh, MeshPhongMaterial, Object3D, Scene, SphereGeometry } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { FullScreenWebGLRenderer, PerspectiveCamera } from "./src/index";
import { setAutoUpdateMatrix } from "./src/Patch/AutoUpdateMatrix";

class Boxes extends InstancedMesh {
    public activable = true;
    public activeId: number;
    private _color = new Color();

    constructor() {
        super(new SphereGeometry(0.1), new MeshPhongMaterial(), 5000);
        this.instanceMatrix.setUsage(DynamicDrawUsage);

        (this as any).bindEvent("pointerintersection", (e) => {
            this.setColorAt(e.intersection.instanceId, this._color.setHex(0xff0000));
            this.instanceColor.needsUpdate = true;
        });

        const temp = new Object3D();
        (temp as any).enabled = false; //TODO per evitare eventi

        const angleX: number[] = [];
        const angleY: number[] = [];
        for (let i = 0; i < this.count; i++) {
            angleX.push(Math.random() * Math.PI * 2);
            angleY.push(Math.random() * Math.PI * 2);
            this.setColorAt(i, new Color().setHex(0xffffff));
        }

        (this as any).bindEvent("framerendering", () => {
            const now = performance.now() / 10000;
            for (let i = 0; i < this.count; i++) {
                temp.position.setFromSphericalCoords(5, angleX[i] * now, angleY[i] * now);
                temp.updateMatrix();
                this.setMatrixAt(i, temp.matrix);
            }
            this.instanceMatrix.needsUpdate = true;
            this.computeBoundingSphere();
        });
    }
}

class CustomScene extends Scene {
    public camera = new PerspectiveCamera(70, 1, 10000).translateZ(10);

    constructor() {
        super();
        this.add(this.camera, new DirectionalLight(0xffffff, 0.9).translateZ(10)); //import adding camera to scene to trigger renderresize event
        this.add(new Boxes());
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