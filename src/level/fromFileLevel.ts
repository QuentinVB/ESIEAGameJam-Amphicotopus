import { AbstractMesh, ArcRotateCamera, CannonJSPlugin, HemisphericLight, Scene, SceneLoader, Vector3, PhysicsImpostor, Mesh, Camera, SpriteManager, Sprite, FollowCamera } from "babylonjs";
import Character from "../components/character";
import Level from "./level";

export default class FromFileLevel extends Level {

  private bagSpriteManager: SpriteManager;
  private meduseSpriteManager: SpriteManager;

  public createLevel = async (): Promise<Scene> => {
    const imported = await SceneLoader.LoadAsync(this.env.CONFIG.meshUrl, this.env.levelName + ".babylon", this.env.engine)
      .then((scene) => {
        this.scene = scene;
        this.scene.clearColor = this.env.CONFIG.BG_COLOR;

        if (!this.env.CONFIG.DEBUG) {
          this.scene.fogColor = this.env.CONFIG.FOG_COLOR;
          this.scene.fogMode = Scene.FOGMODE_LINEAR;
          this.scene.fogStart = this.env.CONFIG.FOG_START;
          this.scene.fogEnd = this.env.CONFIG.FOG_END;
        }
      });

    //DEBUG CAMERA
    if (this.env.CONFIG.DEBUG) {
      const camera = new ArcRotateCamera("DebugCamera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(this.env.canvas, true);
      camera.useFramingBehavior = true;
    }

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    this.scene.enablePhysics(new Vector3(0, this.env.CONFIG.GRAVITY, 0), new CannonJSPlugin());


    //replace camera by follow camera and copy information
    this._camera = this.CreateCameraFromExistingOne(this.scene.getCameraByName("Camera") as Camera, this._character)
    this.scene.activeCamera = this._camera;

    this.bagSpriteManager = new SpriteManager("bagSpriteManager", "./public/img/Sprite-Sac-3x3-min.png", 1, 128, this.scene);
    this.meduseSpriteManager = new SpriteManager("meduseSpriteManager", "./public/img/Sprite-Meduse-3x3-min.png", 1, 128, this.scene);
    for (const mesh of this.scene.meshes) {
      console.log(mesh.name);
      switch (mesh.name) {
        case "Turtle": this.ManageTurtle(mesh); break;
        case "Ground": this.ManageGround(mesh); break;
        case "Medusa": this.AddMedusa(mesh); break;
        case "Bag": this.AddBag(mesh); break;
        default:
          break;
      }
    }
    return this.scene;
  };
  CreateCameraFromExistingOne(originalCamera: Camera, targetCharacter: Character): FollowCamera {
    const originalCoordinates = [];
    originalCamera.position.toArray(originalCoordinates);
    const camera = new FollowCamera("MainCamera", Vector3.Zero(), this.scene);
    camera.fov = originalCamera.fov;
    camera.maxZ = 500;
    camera.radius = 7;
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 8;
    camera.heightOffset = 1;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.5;
    camera.maxCameraSpeed = 20;
    camera.inertia = 0.5;
    camera.lockedTarget = targetCharacter.turtleCameraTarget; //version 2.5 onwards
    return camera;
  }
  ManageTurtle(mesh: AbstractMesh): void {
    this._character = new Character(this, mesh as Mesh);
  }
  ManageGround(mesh: AbstractMesh): void {
    mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
  }
  AddMedusa(mesh: AbstractMesh): void {
    const meduseSprite = new Sprite("sacSprite", this.meduseSpriteManager);
    meduseSprite.playAnimation(0, 7, true, 240);
    meduseSprite.size = 2;
    meduseSprite.position = mesh.position;
  }
  AddBag(mesh: AbstractMesh): void {
    const sacSprite = new Sprite("sacSprite", this.bagSpriteManager);
    sacSprite.playAnimation(0, 7, true, 240);
    sacSprite.size = 2;
    sacSprite.position = mesh.position;
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