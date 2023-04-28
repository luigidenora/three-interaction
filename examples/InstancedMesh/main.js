import { BoxGeometry, Color, DirectionalLight, DynamicDrawUsage, Mesh, MeshPhongMaterial, Scene, SphereGeometry } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { InstancedMesh, InstancedMeshSingle, LoadingMaterial, PerspectiveCamera, WebGLRenderer } from "../../src/index";

const scene = new Scene();
scene.add(
    scene.camera = new PerspectiveCamera(70, 1, 10000).translateZ(10),
    scene.loadingBar = new Mesh(new BoxGeometry(0.2, 10, 1), new LoadingMaterial(10, 0xff0000, 0x00ff00)).translateX(-10),
    scene.spheres = new InstancedMesh(new SphereGeometry(0.1, 10, 10), new MeshPhongMaterial(), 4000, InstancedMeshSingle, new Color(0xffffff)),
    new DirectionalLight(0xffffff, 0.9).translateZ(10)
);

let activatedSpheres = 0;
scene.spheres.instanceMatrix.setUsage(DynamicDrawUsage);
scene.loadingBar.interceptByRaycaster = false;

for (const sphere of scene.spheres.instances) {
    sphere.angleX = Math.random() * Math.PI * 2;
    sphere.angleY = Math.random() * Math.PI * 2;

    sphere.bindEvent("animate", function (time) {
        this.position.setFromSphericalCoords(5, this.angleX * time / 10000, this.angleY * time / 10000);
    });

    sphere.bindEvent("pointerintersection", function (e) {
        if (!this.activated) {
            this.setColor(new Color().setHex(0xff0000));
            this.activated = true;
            this.parent.dispatchEvent({ type: "updated", percentage: ++activatedSpheres / this.parent.count });
        }
    });
}

scene.spheres.addEventListener("updated", (e) => {
    scene.loadingBar.material.setPercentage(e.percentage);
});


scene.loadingBar.bindEvent("animate", function (time) {
    this.material.uniforms.time.value = time / 1000;
});

const renderer = new WebGLRenderer([scene], animate, true, { antialias: true });
const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
    renderer.render(scene, scene.camera);
    stats.update();
}
