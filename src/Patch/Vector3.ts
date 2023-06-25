import { BufferAttribute, Camera, Color, Cylindrical, Euler, MathUtils, Matrix3, Matrix4, Object3D, Quaternion, Spherical, Vector3 } from "three";

/** @internal */
export function applyVector3Patch(target: Object3D): void {
    patchVector(target.position);
    patchVector(target.scale);

    if (target.__scene === undefined) return;

    if (target.__scene.__smartRendering === true) {
        setSmartRenderingChangeCallback(target);
    } else {
        setDefaultChangeCallback(target);
    }
}

/** @internal */
export function setVector3SmartRendering(target: Object3D, value: boolean): void {
    if (value === true) {
        setSmartRenderingChangeCallback(target);
    } else if (target.__vec3Patched === undefined) {
        setDefaultChangeCallback(target);
    }
}

/** @internal */
export function removeVector3Callback(target: Object3D): void {
    if (target.__vec3Patched === true) {
        (target.position as unknown as Vector3Ext)._onChangeCallback = () => { };
        (target.scale as unknown as Vector3Ext)._onChangeCallback = () => { };
    }
}

function patchVector(vec3: any): void {
    vec3._x = vec3.x;
    vec3._y = vec3.y;
    vec3._z = vec3.z;
    vec3.isVector3 = true;
    Object.setPrototypeOf(vec3, Vector3Ext.prototype);

    Object.defineProperties(vec3, {
        x: {
            get() { return this._x; },
            set(value: Number) {
                this._x = value;
                this._onChangeCallback();
            }
        },
        y: {
            get() { return this._y; },
            set(value: Number) {
                this._y = value;
                this._onChangeCallback();
            }
        },
        z: {
            get() { return this._z; },
            set(value: Number) {
                this._z = value;
                this._onChangeCallback();
            }
        }
    });
}

function setSmartRenderingChangeCallback(target: Object3D): void {
    (target.position as unknown as Vector3Ext)._onChangeCallback = () => {
        target.__scene.__needsRender = true;
        target.__eventsDispatcher.dispatchEvent("positionchange");
    };

    (target.scale as unknown as Vector3Ext)._onChangeCallback = () => {
        target.__scene.__needsRender = true;
        target.__eventsDispatcher.dispatchEvent("scalechange");
    };
}

function setDefaultChangeCallback(target: Object3D): void {
    (target.position as unknown as Vector3Ext)._onChangeCallback = () => {
        target.__eventsDispatcher.dispatchEvent("positionchange");
    };

    (target.scale as unknown as Vector3Ext)._onChangeCallback = () => {
        target.__eventsDispatcher.dispatchEvent("scalechange");
    };
}

/** Updated to r153 */
class Vector3Ext {
    public _x: number;
    public _y: number;
    public _z: number;

    set(x: number, y: number, z: number) {

        if (z === undefined) z = this._z; // sprite.scale.set(x,y)

        this._x = x;
        this._y = y;
        this._z = z;

        this._onChangeCallback();

        return this;

    }

    setScalar(scalar: number) {

        this._x = scalar;
        this._y = scalar;
        this._z = scalar;

        this._onChangeCallback();

        return this;

    }

    setX(x: number) {

        this._x = x;

        this._onChangeCallback();

        return this;

    }

    setY(y: number) {

        this._y = y;

        this._onChangeCallback();

        return this;

    }

    setZ(z: number) {

        this._z = z;

        this._onChangeCallback();

        return this;

    }

    setComponent(index: number, value: number) {

        switch (index) {

            case 0: this._x = value; break;
            case 1: this._y = value; break;
            case 2: this._z = value; break;
            default: throw new Error('index is out of range: ' + index);

        }

        this._onChangeCallback();

        return this;

    }

    getComponent(index: number) {

        switch (index) {

            case 0: return this._x;
            case 1: return this._y;
            case 2: return this._z;
            default: throw new Error('index is out of range: ' + index);

        }

    }

    clone() {

        return new (this as any).constructor(this._x, this._y, this._z);

    }

    copy(v: Vector3, update?: boolean) {

        this._x = v.x;
        this._y = v.y;
        this._z = v.z;

        if (update !== false) this._onChangeCallback();

        return this;

    }

    add(v: Vector3) {

        this._x += v.x;
        this._y += v.y;
        this._z += v.z;

        this._onChangeCallback();

        return this;

    }

    addScalar(s: number) {

        this._x += s;
        this._y += s;
        this._z += s;

        this._onChangeCallback();

        return this;

    }

    addVectors(a: Vector3, b: Vector3) {

        this._x = a.x + b.x;
        this._y = a.y + b.y;
        this._z = a.z + b.z;

        this._onChangeCallback();

        return this;

    }

    addScaledVector(v: Vector3, s: number) {

        this._x += v.x * s;
        this._y += v.y * s;
        this._z += v.z * s;

        this._onChangeCallback();

        return this;

    }

    sub(v: Vector3) {

        this._x -= v.x;
        this._y -= v.y;
        this._z -= v.z;

        this._onChangeCallback();

        return this;

    }

    subScalar(s: number) {

        this._x -= s;
        this._y -= s;
        this._z -= s;

        this._onChangeCallback();

        return this;

    }

    subVectors(a: Vector3, b: Vector3) {

        this._x = a.x - b.x;
        this._y = a.y - b.y;
        this._z = a.z - b.z;

        this._onChangeCallback();

        return this;

    }

    multiply(v: Vector3) {

        this._x *= v.x;
        this._y *= v.y;
        this._z *= v.z;

        this._onChangeCallback();

        return this;

    }

    multiplyScalar(scalar: number, update?: boolean) {

        this._x *= scalar;
        this._y *= scalar;
        this._z *= scalar;

        if (update !== false) this._onChangeCallback();

        return this;

    }

    multiplyVectors(a: Vector3, b: Vector3) {

        this._x = a.x * b.x;
        this._y = a.y * b.y;
        this._z = a.z * b.z;

        this._onChangeCallback();

        return this;

    }

    applyEuler(euler: Euler) {

        return this.applyQuaternion(_quaternion.setFromEuler(euler));

    }

    applyAxisAngle(axis: Vector3, angle: number) {

        return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));

    }

    applyMatrix3(m: Matrix3, update?: boolean) {

        const x = this._x, y = this._y, z = this._z;
        const e = m.elements;

        this._x = e[0] * x + e[3] * y + e[6] * z;
        this._y = e[1] * x + e[4] * y + e[7] * z;
        this._z = e[2] * x + e[5] * y + e[8] * z;

        if (update !== false) this._onChangeCallback();

        return this;

    }

    applyNormalMatrix(m: Matrix3) {

        return this.applyMatrix3(m, false).normalize();

    }

    applyMatrix4(m: Matrix4, update?: boolean) {

        const x = this._x, y = this._y, z = this._z;
        const e = m.elements;

        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        this._x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this._y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this._z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

        if (update !== false) this._onChangeCallback();

        return this;

    }

    applyQuaternion(q: Quaternion) {

        const x = this._x, y = this._y, z = this._z;
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

        // calculate quat * vector

        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = - qx * x - qy * y - qz * z;

        // calculate result * inverse quat

        this._x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
        this._y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
        this._z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

        this._onChangeCallback();

        return this;

    }

    project(camera: Camera) {

        return this.applyMatrix4(camera.matrixWorldInverse, false).applyMatrix4(camera.projectionMatrix);

    }

    unproject(camera: Camera) {

        return this.applyMatrix4(camera.projectionMatrixInverse, false).applyMatrix4(camera.matrixWorld);

    }

    transformDirection(m: Matrix4) {

        // input: THREE.Matrix4 affine matrix
        // vector interpreted as a direction

        const x = this._x, y = this._y, z = this._z;
        const e = m.elements;

        this._x = e[0] * x + e[4] * y + e[8] * z;
        this._y = e[1] * x + e[5] * y + e[9] * z;
        this._z = e[2] * x + e[6] * y + e[10] * z;

        return this.normalize();

    }

    divide(v: Vector3) {

        this._x /= v.x;
        this._y /= v.y;
        this._z /= v.z;

        this._onChangeCallback();

        return this;

    }

    divideScalar(scalar: number, update?: boolean) {

        return this.multiplyScalar(1 / scalar, update);

    }

    min(v: Vector3) {

        this._x = Math.min(this._x, v.x);
        this._y = Math.min(this._y, v.y);
        this._z = Math.min(this._z, v.z);

        this._onChangeCallback();

        return this;

    }

    max(v: Vector3) {

        this._x = Math.max(this._x, v.x);
        this._y = Math.max(this._y, v.y);
        this._z = Math.max(this._z, v.z);

        this._onChangeCallback();

        return this;

    }

    clamp(min: Vector3, max: Vector3) {

        // assumes min < max, componentwise

        this._x = Math.max(min.x, Math.min(max.x, this._x));
        this._y = Math.max(min.y, Math.min(max.y, this._y));
        this._z = Math.max(min.z, Math.min(max.z, this._z));

        this._onChangeCallback();

        return this;

    }

    clampScalar(minVal: number, maxVal: number) {

        this._x = Math.max(minVal, Math.min(maxVal, this._x));
        this._y = Math.max(minVal, Math.min(maxVal, this._y));
        this._z = Math.max(minVal, Math.min(maxVal, this._z));

        this._onChangeCallback();

        return this;

    }

    clampLength(min: number, max: number) {

        const length = this.length();

        return this.divideScalar(length || 1, false).multiplyScalar(Math.max(min, Math.min(max, length)));

    }

    floor() {

        this._x = Math.floor(this._x);
        this._y = Math.floor(this._y);
        this._z = Math.floor(this._z);

        this._onChangeCallback();

        return this;

    }

    ceil() {

        this._x = Math.ceil(this._x);
        this._y = Math.ceil(this._y);
        this._z = Math.ceil(this._z);

        this._onChangeCallback();

        return this;

    }

    round() {

        this._x = Math.round(this._x);
        this._y = Math.round(this._y);
        this._z = Math.round(this._z);

        this._onChangeCallback();

        return this;

    }

    roundToZero() {

        this._x = (this._x < 0) ? Math.ceil(this._x) : Math.floor(this._x);
        this._y = (this._y < 0) ? Math.ceil(this._y) : Math.floor(this._y);
        this._z = (this._z < 0) ? Math.ceil(this._z) : Math.floor(this._z);

        this._onChangeCallback();

        return this;

    }

    negate() {

        this._x = - this._x;
        this._y = - this._y;
        this._z = - this._z;

        this._onChangeCallback();

        return this;

    }

    dot(v: Vector3) {

        return this._x * v.x + this._y * v.y + this._z * v.z;

    }

    // TODO lengthSquared?

    lengthSq() {

        return this._x * this._x + this._y * this._y + this._z * this._z;

    }

    length() {

        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);

    }

    manhattanLength() {

        return Math.abs(this._x) + Math.abs(this._y) + Math.abs(this._z);

    }

    normalize(update?: boolean) {

        return this.divideScalar(this.length() || 1, update);

    }

    setLength(length: number) {

        return this.normalize(false).multiplyScalar(length);

    }

    lerp(v: Vector3, alpha: number) {

        this._x += (v.x - this._x) * alpha;
        this._y += (v.y - this._y) * alpha;
        this._z += (v.z - this._z) * alpha;

        this._onChangeCallback();

        return this;

    }

    lerpVectors(v1: Vector3, v2: Vector3, alpha: number) {

        this._x = v1.x + (v2.x - v1.x) * alpha;
        this._y = v1.y + (v2.y - v1.y) * alpha;
        this._z = v1.z + (v2.z - v1.z) * alpha;

        this._onChangeCallback();

        return this;

    }

    cross(v: Vector3) {

        return this.crossVectors(this as any, v); // TODO avoid to user getter

    }

    crossVectors(a: Vector3, b: Vector3) {

        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;

        this._x = ay * bz - az * by;
        this._y = az * bx - ax * bz;
        this._z = ax * by - ay * bx;

        this._onChangeCallback();

        return this;

    }

    projectOnVector(v: Vector3) {

        const denominator = v.lengthSq();

        if (denominator === 0) return this.set(0, 0, 0);

        const scalar = v.dot(this as any) / denominator;

        return this.copy(v, false).multiplyScalar(scalar);

    }

    projectOnPlane(planeNormal: Vector3) {

        _vector.copy(this as unknown as Vector3).projectOnVector(planeNormal);

        return this.sub(_vector);

    }

    reflect(normal: Vector3) {

        // reflect incident vector off plane orthogonal to normal
        // normal is assumed to have unit length

        return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));

    }

    angleTo(v: Vector3) {

        const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

        if (denominator === 0) return Math.PI / 2;

        const theta = this.dot(v) / denominator;

        // clamp, to handle numerical problems

        return Math.acos(MathUtils.clamp(theta, - 1, 1));

    }

    distanceTo(v: Vector3) {

        return Math.sqrt(this.distanceToSquared(v));

    }

    distanceToSquared(v: Vector3) {

        const dx = this._x - v.x, dy = this._y - v.y, dz = this._z - v.z;

        return dx * dx + dy * dy + dz * dz;

    }

    manhattanDistanceTo(v: Vector3) {

        return Math.abs(this._x - v.x) + Math.abs(this._y - v.y) + Math.abs(this._z - v.z);

    }

    setFromSpherical(s: Spherical) {

        return this.setFromSphericalCoords(s.radius, s.phi, s.theta);

    }

    setFromSphericalCoords(radius: number, phi: number, theta: number) {

        const sinPhiRadius = Math.sin(phi) * radius;

        this._x = sinPhiRadius * Math.sin(theta);
        this._y = Math.cos(phi) * radius;
        this._z = sinPhiRadius * Math.cos(theta);

        this._onChangeCallback();

        return this;

    }

    setFromCylindrical(c: Cylindrical) {

        return this.setFromCylindricalCoords(c.radius, c.theta, c.y);

    }

    setFromCylindricalCoords(radius: number, theta: number, y: number) {

        this._x = radius * Math.sin(theta);
        this._y = y;
        this._z = radius * Math.cos(theta);

        this._onChangeCallback();

        return this;

    }

    setFromMatrixPosition(m: Matrix4) {

        const e = m.elements;

        this._x = e[12];
        this._y = e[13];
        this._z = e[14];

        this._onChangeCallback();

        return this;

    }

    setFromMatrixScale(m: Matrix4) {

        const sx = this.setFromMatrixColumn(m, 0).length();
        const sy = this.setFromMatrixColumn(m, 1).length();
        const sz = this.setFromMatrixColumn(m, 2).length();

        this._x = sx;
        this._y = sy;
        this._z = sz;

        this._onChangeCallback();

        return this;

    }

    setFromMatrixColumn(m: Matrix4, index: number) {

        return this.fromArray(m.elements, index * 4);

    }

    setFromMatrix3Column(m: Matrix3, index: number) {

        return this.fromArray(m.elements, index * 3);

    }

    setFromEuler(e: any) {

        this._x = e._x;
        this._y = e._y;
        this._z = e._z;

        this._onChangeCallback();

        return this;

    }

    setFromColor(c: Color) {

        this._x = c.r;
        this._y = c.g;
        this._z = c.b;

        this._onChangeCallback();

        return this;

    }

    equals(v: Vector3) {

        return ((v.x === this._x) && (v.y === this._y) && (v.z === this._z));

    }

    fromArray(array: number[], offset = 0) {

        this._x = array[offset];
        this._y = array[offset + 1];
        this._z = array[offset + 2];

        this._onChangeCallback();

        return this;

    }

    toArray(array: number[] = [], offset = 0) {

        array[offset] = this._x;
        array[offset + 1] = this._y;
        array[offset + 2] = this._z;

        return array;

    }

    fromBufferAttribute(attribute: BufferAttribute, index: number) {

        this._x = attribute.getX(index);
        this._y = attribute.getY(index);
        this._z = attribute.getZ(index);

        this._onChangeCallback();

        return this;

    }

    random() {

        this._x = Math.random();
        this._y = Math.random();
        this._z = Math.random();

        this._onChangeCallback();

        return this;

    }

    randomDirection() {

        // Derived from https://mathworld.wolfram.com/SpherePointPicking.html

        const u = (Math.random() - 0.5) * 2;
        const t = Math.random() * Math.PI * 2;
        const f = Math.sqrt(1 - u ** 2);

        this._x = f * Math.cos(t);
        this._y = f * Math.sin(t);
        this._z = u;

        this._onChangeCallback();

        return this;

    }

    public _onChangeCallback() { }

    *[Symbol.iterator]() {

        yield this._x;
        yield this._y;
        yield this._z;

    }

}

const _vector = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();
