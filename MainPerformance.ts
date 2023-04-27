import { BoxGeometry, Color, DirectionalLight, DynamicDrawUsage, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, RawShaderMaterial, Scene, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { FullScreenWebGLRenderer, PerspectiveCamera, LoadingMaterial } from "./src/index";

class Spheres extends InstancedMesh {
    public activable = true;
    public activatedSpheres = 0;
    private _color = new Color();
    private _red = new Color().setHex(0xff0000);
    private _white = new Color().setHex(0xffffff);

    constructor() {
        super(new SphereGeometry(0.1, 10, 10), new MeshPhongMaterial(), 5000);
        this.instanceMatrix.setUsage(DynamicDrawUsage);

        (this as any).bindEvent("pointerintersection", (e) => {
            this.getColorAt(e.intersection.instanceId, this._color);
            if (this._color.equals(this._white)) {
                this.setColorAt(e.intersection.instanceId, this._red);
                this.instanceColor.needsUpdate = true;
                this.dispatchEvent({ type: "updated", percentage: ++this.activatedSpheres / this.count });
            }
        });

        const matrix = new Matrix4();
        const position = new Vector3();

        const angleX: number[] = [];
        const angleY: number[] = [];
        for (let i = 0; i < this.count; i++) {
            angleX.push(Math.random() * Math.PI * 2);
            angleY.push(Math.random() * Math.PI * 2);
            this.setColorAt(i, this._white);
        }

        (this as any).bindEvent("framerendering", () => {
            const now = performance.now() / 10000;
            for (let i = 0; i < this.count; i++) {
                position.setFromSphericalCoords(5, angleX[i] * now, angleY[i] * now);
                matrix.makeTranslation(position.x, position.y, position.z);
                this.setMatrixAt(i, matrix);
            }
            this.instanceMatrix.needsUpdate = true;
            this.computeBoundingSphere();
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