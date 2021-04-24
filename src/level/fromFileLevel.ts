import { ArcRotateCamera, CannonJSPlugin, HemisphericLight, Scene, SceneLoader, Vector3, PhysicsImpostor, Mesh, Camera, Color4, FollowCamera } from "babylonjs";
import Character from "../components/character";
import Level from "./level";

export default class FromFileLevel extends Level {

  public createLevel = async (): Promise<Scene> => {
    const imported = await SceneLoader.LoadAsync(this.env.CONFIG.meshUrl, this.env.levelName + ".babylon", this.env.engine)
      .then((scene) => {
        this.scene = scene;
        this.scene.clearColor = this.env.CONFIG.BG_COLOR;
        this.scene.fogColor = this.env.CONFIG.FOG_COLOR;
        this.scene.fogMode = Scene.FOGMODE_LINEAR;
        this.scene.fogStart = this.env.CONFIG.FOG_START;
        this.scene.fogEnd = this.env.CONFIG.FOG_END;
      });

    //DEBUG CAMERA
    const camera = new ArcRotateCamera("DebugCamera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.env.canvas, true);
    camera.useFramingBehavior = true;
    //this.scene.activeCamera = camera;
    //this._camera = camera;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    this.scene.enablePhysics(new Vector3(0, this.env.CONFIG.GRAVITY, 0), new CannonJSPlugin());

    //bind character
    this._character = new Character(this, this.scene.getMeshByName("Character") as Mesh)

    //replace camera by follow camera and copy information

    this._camera = this.CreateCameraFromExistingOne(this.scene.getCameraByName("Camera") as Camera, this._character)
    this.scene.activeCamera = this._camera;


    //bind ground
    const ground = this.scene.getMeshByName("Ground");
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);


    return this.scene;
  };
  CreateCameraFromExistingOne(originalCamera: Camera, targetCharacter: Character): FollowCamera {
    const originalCoordinates = [];
    originalCamera.position.toArray(originalCoordinates);
    //originalCoordinates[2] = -originalCoordinates[2];
    console.log(originalCoordinates);
    //Vector3.Zero()
    const camera = new FollowCamera("MainCamera", Vector3.Zero(), this.scene);
    //const camera = new ArcFollowCamera("MainCamera", -Math.PI / 2, 0, 8, targetCharacter.MainMesh, this.scene);
    camera.fov = originalCamera.fov;
    camera.maxZ = 500;

    // The goal distance of camera from target
    camera.radius = 7;
    //camera.beta += Math.PI / 8;

    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 8;
    // The goal height of camera above local origin (centre) of target
    camera.heightOffset = 2;

    // The goal rotation of camera around local origin (centre) of target in x y plane
    camera.rotationOffset = 180;

    // Acceleration of camera in moving from current to goal position
    camera.cameraAcceleration = 0.5;

    // The speed at which acceleration is halted
    camera.maxCameraSpeed = 20;

    // This attaches the camera to the canvas
    //camera.attachControl(true); 
    camera.inertia = 0.5;

    //attach the target mesh
    //camera.target = targetCharacter.MainMesh.position;
    camera.lockedTarget = targetCharacter.MainMesh; //version 2.5 onwards

    return camera;
  }

  /*
    public preTasks? = (): Promise<unknown>[] => {
      return undefined;
    };
    */
  /*
       BABYLON.SceneLoader.LoadAssetContainer("assets/mesh/", "house.babylon", scene, function (container) {
           defaultHouse= container.meshes[0];     
       });
   */
  /*
   if (levelname) {
     
   }
   else {
     this.scene = new Scene(this.env.engine);
 
     //this.InitLevel();
   }
*/
}