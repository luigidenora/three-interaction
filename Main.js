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
        
        this.scene.children[0].add(new Mesh(new BoxGeometry(1, 1, 1)).translateX(3));
        this.scene.children[1].add(new Mesh(new BoxGeometry(1, 1, 1)).translateX(-3));

        this.scene.children[0].addEventListener("_vec3Changed", () => console.log("changed"));
        this.scene.children[1].addEventListener("_vec3Changed", () => console.log("changed"));

        this.scene.children[0].position.copy(this.scene.children[1].position);

        this.scene.children[0].activable = true;
        this.scene.children[1].activable = true;

        // this.scene.children[0].bindProperty("material", function() { console.log(this); return this.active ? hoverMaterial : material }); //TODO FIX binding
        this.scene.children[0].bindProperty("material", () => this.scene.children[0].active ? hoverMaterial : material);
        this.scene.children[1].bindProperty("material", () => this.scene.children[1].active ? hoverMaterial : material);

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