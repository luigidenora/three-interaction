import { Renderer } from "three";

export class EventsManager {

    constructor(renderer: Renderer) {
        const domElement = renderer.domElement; 

        domElement.addEventListener("mousedown", (e) => { console.log(e.type) });
        domElement.addEventListener("mouseUp", (e) => { console.log(e.type) });
        domElement.addEventListener("click", (e) => { console.log(e.type) });
        domElement.addEventListener("dblClick", (e) => { console.log(e.type) });
        domElement.addEventListener("mouseEnter", (e) => { console.log(e.type) });
        domElement.addEventListener("mouseOver", (e) => { console.log(e.type) });
        domElement.addEventListener("mouseMove", (e) => { console.log(e.type) });
        domElement.addEventListener("mouseLeave", (e) => { console.log(e.type) });
        domElement.addEventListener("mouseOut", (e) => { console.log(e.type) });

        domElement.addEventListener("pointercancel", (e) => { console.log(e.type) });
        domElement.addEventListener("pointerdown", (e) => { console.log(e.type) });
        domElement.addEventListener("pointerenter", (e) => { console.log(e.type) });
        domElement.addEventListener("pointerleave", (e) => { console.log(e.type) });
        domElement.addEventListener("pointermove", (e) => { console.log(e.type) });
        domElement.addEventListener("pointerout", (e) => { console.log(e.type) });
        domElement.addEventListener("pointerover", (e) => { console.log(e.type) });
        domElement.addEventListener("pointerup", (e) => { console.log(e.type) });

        domElement.addEventListener("touchstart", (e) => { console.log(e.type) });
        domElement.addEventListener("touchcancel", (e) => { console.log(e.type) });
        domElement.addEventListener("touchend", (e) => { console.log(e.type) });
        domElement.addEventListener("touchmove", (e) => { console.log(e.type) });

        domElement.addEventListener("wheel", (e) => { console.log(e.type) });

        domElement.addEventListener("keydown", (e) => { console.log(e.type) });
        domElement.addEventListener("keyup", (e) => { console.log(e.type) });
    }
}
