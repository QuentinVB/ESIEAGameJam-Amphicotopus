import { AbstractMesh, ArcRotateCamera, CannonJSPlugin, HemisphericLight, Scene, SceneLoader, Vector3, PhysicsImpostor, Mesh, Camera, SpriteManager, Sprite, FollowCamera } from "babylonjs";
import Character from "../components/character";
import { ISpriteInfo, SpriteLibrary } from "../components/spriteLib";
import Level from "./level";

export default class FromFileLevel extends Level {
  private spriteLibrary: SpriteLibrary;

  public createLevel = async (): Promise<Scene> => {
    await SceneLoader.LoadAsync(this.env.CONFIG.meshUrl, this.env.levelName + ".babylon", this.env.engine)
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

    //TODO : should be removed
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    this.scene.enablePhysics(new Vector3(0, this.env.CONFIG.GRAVITY, 0), new CannonJSPlugin());

    // load sprites
    this.spriteLibrary = new SpriteLibrary(this.scene);

    for (const mesh of this.scene.meshes) {
      console.log(mesh.name);
      //mesh.name.startsWith("Medusa")
      switch (mesh.name) {
        case "Turtle": this.ManageTurtle(mesh); break;
        case "Ground": this.ManageGround(mesh); break;
        //TODO : case rock ? (or tag collidable ?)
        default:
          break;
      }
    }
    this.AddSpritesFromTag("Medusa");
    this.AddSpritesFromTag("PinkCoral");
    this.AddSpritesFromTag("Bag");

    //replace camera by follow camera and copy information
    this._camera = this.CreateCameraFromExistingOne(this.scene.getCameraByName("Camera") as Camera, this._character)
    this.scene.activeCamera = this._camera;

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

  AddSpritesFromTag(tag: string): void {
    const meshes = this.scene.getMeshesByTags(tag);
    const spriteInfo: ISpriteInfo = this.spriteLibrary[tag];
    for (const mesh of meshes) {
      const instanceOfSprite = new Sprite("sacSprite", spriteInfo.manager);
      instanceOfSprite.playAnimation(spriteInfo.animationStart, spriteInfo.animationEnd, true, spriteInfo.animationDelay);
      instanceOfSprite.size = spriteInfo.size;
      instanceOfSprite.position = mesh.position;
      mesh.dispose();
    }
  }
  //TODO : should refactor sprite creation...


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