import { Scene, Vector3 } from "three";
import { Target } from "./Events/Events";

export class Utils {
    public static eps = 10 ** -8;

    public static areVector3Equals(v1: Vector3, v2: Vector3, eps = this.eps): boolean {
        if (v1 && v2 && Math.abs(v1.x - v2.x) <= eps && Math.abs(v1.y - v2.y) <= eps && Math.abs(v1.z - v2.z) <= eps) {
            return true;
        }
        return false;
    }

    public static getSceneFromObj(obj: Target): Scene {
        while (obj) {
            if ((obj as Scene).isScene) {
                return obj as Scene;
            }
            obj = obj.parent;
        }
    }
}