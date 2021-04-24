import { ArcRotateCamera, GroundBuilder, HemisphericLight, Scene, SphereBuilder, Vector3 } from "babylonjs";
import Level from "./level";

export default class DefaultLevel extends Level {

  public createLevel = async (): Promise<Scene> => {
    const scene = new Scene(this.env.engine);
    this.scene = scene;

    //setup a rotating camera around the center of the scene
    const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.env.canvas, true);
    camera.useFramingBehavior = true;
    this._camera = camera;


    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    const sphere = SphereBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene
    );
    sphere.position.y = 1;

    // Our built-in 'ground' shape.
    const ground = GroundBuilder.CreateGround(
      "ground",
      { width: 6, height: 6 },
      scene
    );

    return scene;
  };
  /*
    public preTasks? = (): Promise<unknown>[] => {
      return undefined;
    };
    */
}