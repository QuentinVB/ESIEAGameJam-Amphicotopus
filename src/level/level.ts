import { Scene, Camera, ArcFollowCamera, UniversalCamera, Mesh, Vector3, KeyboardEventTypes, CannonJSPlugin, Engine, SceneLoader, Color4 } from 'babylonjs';
import Helpers from '../helpers/helpers'
import Core from '../core'
import { Character, Ground, Skybox } from '../components/index';

import * as States from '../states/index';
import { Light } from 'babylonjs/Lights/light';

//TODO : Should be in a different file
export interface CreateLevelClass {
  createLevel: () => Promise<Scene>;
  preTasks?: Promise<unknown>[];
}

export interface CreateLevelModule {
  default: CreateLevelClass;
}


export default abstract class Level implements CreateLevelClass {
  //public
  public scene: Scene;
  public _camera: Camera = null;
  public _character: Character = null;
  public _lights: Light[] = [];
  public gameState: States.AbstractState;

  //protected
  protected readonly env: Core;

  //engine: Engine, canvas: HTMLCanvasElement
  constructor(env: Core, levelname?: string) {

    this.env = env;
    /*
        BABYLON.SceneLoader.LoadAssetContainer("assets/mesh/", "house.babylon", scene, function (container) {
            defaultHouse= container.meshes[0];     
        });
    */
    /*
     if (levelname) {
       SceneLoader.LoadAsync(env.CONFIG.meshUrl, levelname + ".babylon", this.env.engine)
         .then((scene) => {
           this.scene = scene;
           console.log(scene);
           this.loadMeshes();
           //this.InitLevel();
         });
     }
     else {
       this.scene = new Scene(this.env.engine);
 
       //this.InitLevel();
     }
 */
    this.gameState = new States.Default(this.env);

  }
  public abstract createLevel: () => Promise<Scene>;
  //public abstract preTasks?: Promise<unknown>[];

  public InitLevel(): void {
    //activate physic
    //this.scene.enablePhysics(new Vector3(0, this.env.CONFIG.GRAVITY, 0), new CannonJSPlugin());
    //background 
    //TODO : where do I put this ?
    //this.scene.clearColor = new Color4(0.0, 0.0, 0.0, 1);

    //meshes
    //this.loadMeshes();//TODO and bind them
    //actions
    //this.bindActions();

    //DEBUG
    if (this.env.CONFIG.DEBUG) {
      this.scene.debugLayer.show();
      Helpers.showAxis(7, this.scene);
    }
    this.scene.registerBeforeRender(() => { this.gameState.Update() });
  }
  /*
   * load the meshes from the file and assign the rôles
   */
  private loadMeshes() {
    //setup a character
    //this._character = new Character(this);

    //setup a rotating camera around the center of the scene
    //this._camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);

    //use this to setup a camera ready to follow the character
    /*
        this._camera = new ArcFollowCamera("ArcCamera", this.env.CONFIG.camera[0], this.env.CONFIG.camera[1], this.env.CONFIG.camera[2], this._character.MainMesh, this.scene);
        //this.scene.getMeshByName("collide"),
        this._camera.attachControl(this.env.canvas, true);
        this.scene.activeCamera = this._camera;
    */
    //TODO : TEMP CAMERA, SHOULD BIND IT FROM THE SCENE FILE
    // Parameters : name, position, scene
    const camera = new UniversalCamera("UniversalCamera", new Vector3(0, 0, -10), this.scene);
    // Targets the camera to a particular position. In this case the scene origin
    camera.setTarget(Vector3.Zero());
    this._camera = camera;
    // Attach the camera to the canvas
    this._camera.attachControl(this.env.canvas, true);


    //link character and camera if follow camera
    //this._camera.target = this._character;

    //setup lights
    //this._lights.push(new PointLight("light", new Vector3(5, 5, -5), this.scene));

    //setup ground
    //this._ground = new Ground(this);

    //skybox

    //this._skybox = Skybox.create(this.env, this);

    //const blackhole = new Blackhole(this);

  }

  private bindActions() {
    //actions from keys
    this.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYDOWN) {
        switch (kbInfo.event.keyCode) {
          //spaceBar
          case 32:
            this._character.MainMesh.translate(new Vector3(1, 0, 0), 3);
            break;
        }
      }
    });

    //actions from mouse
    this.scene.onPointerDown = (evt, pickResult) => {
      // if the click hits the ground object, we change the impact position
      if (pickResult.hit) {
        console.log(" x = " + pickResult.pickedPoint.x + " y = " + pickResult.pickedPoint.z);
      }
    }
  }
}
