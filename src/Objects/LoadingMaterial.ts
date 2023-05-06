import { Color, ShaderMaterial } from "three";

export class LoadingMaterial extends ShaderMaterial {
    public override vertexShader = `
        varying vec2 vUv;

		void main() {
            vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`;

    public override fragmentShader = `
        uniform vec3 empty;
        uniform vec3 fill;
        uniform float percentage;
        uniform float time;
        uniform float height;
        varying vec2 vUv;

        void main() {
            if (vUv.y > percentage) {
                gl_FragColor = vec4(empty + (sin(vUv.y * height + time) * 0.2 - 0.1), 1.0);
            } else {
                gl_FragColor = vec4(fill + (cos(vUv.y * height + time) * 0.2 - 0.1), 1.0);
            }
        }`;

    constructor(height: number, emptyColor: number, fillColor: number) {
        super();
        this.uniforms = {
            "empty": { value: new Color(emptyColor) },
            "fill": { value: new Color(fillColor) },
            "percentage": { value: 0 },
            "time": { value: 0 },
            "height": { value: height }
        };
    }

    public setPercentage(value: number): void {
        this.uniforms.percentage.value = value;
    }
}