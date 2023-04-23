import { Vector3 } from "three";

export class Utils {
    public static eps = 10 ** -6;

    public static areVector3Equals(v1: Vector3, v2: Vector3): boolean {
        if (v1 && v2 && Math.abs(v1.x - v2.x) <= this.eps && Math.abs(v1.y - v2.y) <= this.eps && Math.abs(v1.z - v2.z) <= this.eps) {
            return true;
        }
        return false;
    }
}