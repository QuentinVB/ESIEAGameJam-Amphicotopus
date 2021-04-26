import { AbstractMesh, ArcRotateCamera, CannonJSPlugin, HemisphericLight, Scene, SceneLoader, Vector3, PhysicsImpostor, Mesh, Camera, ShadowGenerator, Sprite, FollowCamera, DirectionalLight, ExecuteCodeAction, ActionManager } from "babylonjs";
import { AdvancedDynamicTexture, Control, Rectangle, Image } from "babylonjs-gui";
import Character from "../components/character";
import { ISpriteInfo, SpriteLibrary } from "../services/spriteLib";
import Level from "./level";
import * as States from '../states/index';

export default class FromFileLevel extends Level {

  public _grounds: Mesh[] = [];//TODO : should be ground object


  public createLevel = async (): Promise<Scene> => {
    await SceneLoader.LoadAsync(this.env.CONFIG.meshUrl, this.env.levelName + ".babylon", this.env.engine)
      .then((scene) => {
        this.scene = scene;
        this.scene.clearColor = this.env.CONFIG.BG_COLOR;
        this.scene.collisionsEnabled = true;
        if (!this.env.CONFIG.DEBUG) {
          this.scene.fogColor = this.env.CONFIG.FOG_COLOR;
          this.scene.fogMode = Scene.FOGMODE_LINEAR;
          this.scene.fogStart = this.env.CONFIG.FOG_START;
          this.scene.fogEnd = this.env.CONFIG.FOG_END;
        }
      });


    //PHYSIC
    this.scene.enablePhysics(new Vector3(0, this.env.CONFIG.GRAVITY, 0), new CannonJSPlugin());

    //SPRITE
    this.spriteLibrary = new SpriteLibrary(this.scene);

    //LOAD OBJECTS
    this.ManageTurtle(this.scene.getMeshByName("Turtle"));

    this.AddSpritesFromTag("Medusa");
    this.AddSpritesFromTag("PinkCoral");
    this.AddSpritesFromTag("Bag");
    this.AddSpritesFromTag("Gorgon");
    this.AddSpritesFromTag("Poisson");

    this.ManageGoodItems("Medusa");
    this.ManageBadItems("Bag");

    this.ManageObstacles("Obstacle");
    this.ManageGrounds("Ground");

    //LIGHTS
    //TODO : should be removed
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;
    const dirlight = new DirectionalLight("pointLight", new Vector3(0, -1, 0), this.scene);

    const shadowGenerator = new ShadowGenerator(1024, dirlight);
    shadowGenerator.addShadowCaster(this._character.MainMesh)
    //shadowGenerator.getShadowMap().renderList.push();

    //CAMERA
    this._camera = this.CreateCameraFromExistingOne(this.scene.getCameraByName("Camera") as Camera, this._character)
    this.scene.activeCamera = this._camera;
    //DEBUG CAMERA
    if (this.env.CONFIG.DEBUG) {
      const camera = new ArcRotateCamera("DebugCamera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(this.env.canvas, true);
      camera.useFramingBehavior = true;
    }

    //GUI
    this.CreateUI();

    //STATE
    const trigger = this.scene.getMeshByName("Trigger");
    this.gameState = new States.Game(this.env, trigger as Mesh);

    return this.scene;
  };
  /**
   * replace camera by follow camera and copy information
   * @param originalCamera 
   * @param targetCharacter 
   * @returns 
   */
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
  CreateUI(): void {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const size = 0.5;


    const hp = 771 * size;
    const x = 60 * size;
    const y = 155 * size;
    const mainContainer = new Rectangle();
    mainContainer.height = "20px";
    mainContainer.width = hp + "px";
    mainContainer.thickness = 0;
    mainContainer.background = "";
    mainContainer.top = x + "px";
    //mainContainer.left = y + "px";
    mainContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    mainContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(mainContainer);

    const containerbg = new Rectangle();
    containerbg.thickness = 0;
    containerbg.background = "lime";
    containerbg.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    mainContainer.addControl(containerbg);


    const bgContainer = new Rectangle("bgContainer");
    bgContainer.width = size * 996 + "px";
    bgContainer.height = size * 145 + "px";
    bgContainer.verticalAlignment = Rectangle.VERTICAL_ALIGNMENT_TOP;
    bgContainer.horizontalAlignment = Rectangle.HORIZONTAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(bgContainer);

    const imageBg = new Image("startbg", "./public/img/Stamina-bar.png");
    imageBg.stretch = Image.STRETCH_EXTEND;
    bgContainer.addControl(imageBg);

    this.scene.onBeforeRenderObservable.add(() => {
      containerbg.width = this.env.stamina / this.env.CONFIG.MAXSTAMINA;
    });
  }

  ManageTurtle(mesh: AbstractMesh): void {
    this._character = new Character(this, mesh as Mesh);
  }
  ManageGrounds(tagQuery: string): void {
    this._grounds = this.scene.getMeshesByTags(tagQuery);
    //TODO : should create ground items
    this._grounds.forEach(item => {
      //item.receiveShadows = true;
      item.physicsImpostor = new PhysicsImpostor(item, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 1 }, this.scene);
    });
    /*
        this._grounds.push(this.scene.getMeshByName(tagQuery) as Mesh);
        //TODO : should create ground items
        this._grounds.forEach(item => {
          item.receiveShadows = true;
          item.physicsImpostor = new PhysicsImpostor(item, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 1 }, this.scene);
        });*/
  }

  ManageGoodItems(tagQuery: string): void {
    const goodItems = this.scene.getMeshesByTags(tagQuery);
    goodItems.forEach(item => {
      item.checkCollisions = true;
      if (this.env.CONFIG.DEBUG) item.isVisible = true;
      this._character.MainMesh.actionManager.registerAction(
        new ExecuteCodeAction(
          {
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: item
          },
          () => {
            this.env.stamina += this.env.CONFIG.MEDUSASTAMINAVALUE;
            console.info("collided with medusa !");
            this.removeItemAndSprite(item.name);
          }
        )
      );
    });
  }
  ManageBadItems(tagQuery: string): void {
    const badItems = this.scene.getMeshesByTags(tagQuery);
    badItems.forEach(item => {
      item.checkCollisions = true;
      if (this.env.CONFIG.DEBUG) item.isVisible = true;
      this._character.MainMesh.actionManager.registerAction(
        new ExecuteCodeAction(
          {
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: item
          },
          () => {
            this.env.stamina -= this.env.CONFIG.BAGSTAMINACOST;
            console.info("collided with bag !");
            this.removeItemAndSprite(item.name);

          }
        )
      );
    });
  }


  ManageObstacles(tagQuery: string): void {
    const obstacle = this.scene.getMeshesByTags(tagQuery);
    obstacle.forEach(item => {
      item.checkCollisions = true;
      item.physicsImpostor = new PhysicsImpostor(item, PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1.0
      });
    });
  }
  removeItemAndSprite(name: string): void {
    const item = this.scene.getMeshByName(name);
    const spriteName = "sprite-" + name.split('-')[1];
    const sprite = this.spriteRefs[spriteName];
    if (sprite) sprite.dispose();
    if (item) item.dispose();
    if (item && sprite) delete this.spriteRefs[spriteName];
    //

    //
    //item.isVisible = false;
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
    /*
for (const mesh of this.scene.meshes) {
//console.log(mesh.name);
switch (mesh.name) {
case "Turtle": this.ManageTurtle(mesh); break;
case "": break;
default:
break;
}
}*/