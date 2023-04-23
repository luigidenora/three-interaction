import { WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { EventsManager } from "./src";
import { computeAutoBinding } from "three-binding";

class Main {

    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true });
        this.scene = new Scene();
        const material = new MeshBasicMaterial({ color: 0xffffff });
        const hoverMaterial = new MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new Mesh(new SphereGeometry(0.2));
        this.scene.add(new Mesh(new BoxGeometry(2, 2, 2)).translateX(4));
        this.scene.add(new Mesh(new BoxGeometry(2, 2, 2)).translateX(-4));

        this.scene.children[0].activable = true;
        this.scene.children[1].activable = true;

        // this.scene.children[0].bindEvent("focus", function (e) { this.material = hoverMaterial });
        // this.scene.children[0].bindEvent("blur", function (e) { this.material = material });

        this.scene.children[0].bindEvent("focus", function (e) { console.log(e.type + " on " + this.id) });
        this.scene.children[0].bindEvent("blur", function (e) { console.log(e.type + " on " + this.id) });
        this.scene.children[1].bindEvent("focus", function (e) { console.log(e.type + " on " + this.id) });
        this.scene.children[1].bindEvent("blur", function (e) { console.log(e.type + " on " + this.id) });

        // this.scene.children[0].bindEvent("click", (e) => console.log(e.type));
        // this.scene.children[0].bindEvent("dblClick", (e) => console.log(e.type));
        // this.scene.children[0].bindEvent("mouseDown", (e) => console.log(e.type));
        // this.scene.children[0].bindEvent("mouseUp", (e) => console.log(e.type));
        // this.scene.children[0].bindEvent("mouseOver", function () { this.material = hoverMaterial });
        // this.scene.children[0].bindEvent("mouseOut", function () { this.material = material });
        // // this.scene.children[0].bindEvent("mouseMove", function (e) { sphere.position.copy(e.intersection.point) });
        // this.scene.children[0].bindEvent("pointerIntersection", function (e) { sphere.position.copy(e.intersection.point) });
        // this.scene.children[1].bindEvent("click", (e) => console.log(e.type));
        // this.scene.children[1].bindEvent("dblClick", (e) => console.log(e.type));
        // this.scene.children[1].bindEvent("pointerdown", (e) => console.log(e.type));
        // this.scene.children[1].bindEvent("pointerUp", (e) => console.log(e.type));
        // this.scene.children[1].bindEvent("pointerOver", function () { this.material = hoverMaterial });
        // this.scene.children[1].bindEvent("pointerOut", function () { this.material = material });
        // // this.scene.children[1].bindEvent("pointerMove", function (e) { sphere.position.copy(e.intersection.point) });
        // this.scene.children[1].bindEvent("pointerIntersection", function (e) { console.log(e); sphere.position.copy(e.intersection.point) });
        this.scene.add(sphere);
        sphere.interceptByRaycaster = false;
        this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000).translateZ(10);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        document.body.appendChild(this.renderer.domElement);
        this.eventsManager = new EventsManager(this.renderer);
    }

    animate(time) {
        this.eventsManager.update(this.scene, this.camera);
        computeAutoBinding(this.scene);
        this.renderer.render(this.scene, this.camera);
    }
}

window.main = new Main();