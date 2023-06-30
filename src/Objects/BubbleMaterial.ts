import { CanvasTexture, Color, ShaderMaterial, Texture, Vector2 } from "three";

interface BubbleMaterialParameters {
    map?: CanvasTexture;
    resolution?: Vector2;
}

export class BubbleMaterial extends ShaderMaterial {
    public override vertexShader = `
    varying vec3 radius;
    varying vec3 vNormal;
    varying vec2 vUv;
  
    uniform float time;
  
    void main() {
      vec3 noise = vec3(abs(sin(time / 2.0 + position.x)) * 0.1, abs(cos(time / 2.0 + position.x)) * 0.1 ,0.0);
      vUv = uv;
      vNormal = vec3(0.0 , 0.0,-1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position + noise, 1.0);
    }`;

    public override fragmentShader = `
    uniform sampler2D map;
    uniform vec2 resolution;
    varying vec3 vNormal;
    varying vec2 vUv;
  
    vec3 getNormal(vec2 point2D, float radius) {
      float x = (point2D.x - 0.5) * 2.0 * radius;
      float y = (point2D.y - 0.5) * 2.0 * radius;
      float z = sqrt(max(0.0, radius * radius - x * x - y * y));
          return vec3(x, y, z); 
      }
  
  
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
  
      vec3 normal =  getNormal(vUv,1.0);

      float iorRatioR = 0.9900;
      float iorRatioG = 0.9910;
      float iorRatioB = 0.9920;
      vec2 center = vec2(0.5,0.5);
      float distance = distance(center,vUv);
  
      if(distance > 0.495){
          gl_FragColor = vec4(0.0,0.0,0.0,0.1);
      } else {
        vec3 refractVecR = refract(vNormal,normal,iorRatioR);
        vec3 refractVecG = refract(vNormal,normal,iorRatioG);
        vec3 refractVecB = refract(vNormal,normal,iorRatioB);
        vec4 color = vec4(0.0);
        color.r = texture2D(map, uv.xy + refractVecR.xy).r;
        color.g = texture2D(map, uv.xy + refractVecG.xy).g;
        color.b = texture2D(map, uv.xy + refractVecB.xy).b;
        color.a = 1.0;
        gl_FragColor = color;
      }

      #include <colorspace_fragment>

      }`;

    constructor(params?: BubbleMaterialParameters) {
        super({
            uniforms: {
                map: { value: params?.map },
                resolution: { value: params?.resolution },
                time: { value: 0 },
            },
        });
    }

    public setResolution(width: number, height: number): void {
        if (!this.uniforms.resolution.value) {
            this.uniforms.resolution.value = new Vector2();
        }
        this.uniforms.resolution.value.set(width, height);
    }

    public setTexture(texture: Texture): void {
        this.uniforms.map.value = texture;
    }

    public setTime(time: number): void {
        this.uniforms.time.value = time;
    }
}
