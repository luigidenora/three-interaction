import { ShaderMaterial } from "three";
export declare class LoadingMaterial extends ShaderMaterial {
    vertexShader: string;
    fragmentShader: string;
    constructor(height: number, emptyColor: number, fillColor: number);
    setPercentage(value: number): void;
}
