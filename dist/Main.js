import { WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, Mesh } from "https://unpkg.com/three@0.151.0/build/three.module.js";
import { EventsManager } from "./EventsManager";

class Main {
    
    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true });
        this.scene = new Scene();
        this.scene.add(new Mesh(new BoxGeometry(1, 1, 1)));
        this.scene.children[0].bindEvent("click", (e) => console.log(e.type));
        this.scene.children[0].bindEvent("mouseDown", (e) => console.log(e.type));
        this.scene.children[0].bindEvent("mouseUp", (e) => console.log(e.type));
        this.scene.children[0].bindEvent("MouseOver", (e) => console.log(e.type));
        this.scene.children[0].bindEvent("MouseOut", (e) => console.log(e.type));
        this.scene.children[0].bindEvent("mousemove", (e) => console.log(e.type));
        this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000).translateZ(10);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        document.body.appendChild(this.renderer.domElement);
        this.eventsManager = new EventsManager(this.renderer);
    }
    
    animate(time) {
        this.eventsManager.update(this.scene, this.camera);
        // computeAutoBinding(this.scene);
        this.renderer.render(this.scene, this.camera);
    }
}

window.main = new Main();