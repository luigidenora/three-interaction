import { Vector3 } from "three";

export class Utils {
    public static tolerance = 10 ** -5; //cambiare nome TODO

    public static areVector3Equals(v1: Vector3, v2: Vector3): boolean {
        if (v1 && v2 && Math.abs(v1.x - v2.x) <= this.tolerance && Math.abs(v1.y - v2.y) <= this.tolerance && Math.abs(v1.z - v2.z) <= this.tolerance) {
            return true;
        }
        return false;
    }
}