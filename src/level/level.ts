import { Scene, Camera, Vector3, KeyboardEventTypes } from 'babylonjs';
import Helpers from '../helpers/helpers'
import Core from '../core'
import { Character } from '../components/index';
import * as States from '../states/index';
import { Light } from 'babylonjs/Lights/light';
import ICreateLevelClass from './ICreateLevelClass';



export default abstract class Level implements ICreateLevelClass {
  //public
  public scene: Scene;
  public _camera: Camera = null;
  public _character: Character = null;
  public _lights: Light[] = [];
  public gameState: States.AbstractState;
  //protected
  public readonly env: Core;

  constructor(env: Core) {
    this.env = env;

    this.gameState = new States.Default(this.env);
  }
  public abstract createLevel: () => Promise<Scene>;

  public InitLevel(): void {
    //background 
    //TODO : where do I put this ?


    //actions
    //this.bindActions();

    //DEBUG
    if (this.env.CONFIG.DEBUG) {
      this.scene.debugLayer.show();
      Helpers.showAxis(7, this.scene);
    }
    this.env.registerFunctionBeforeUpdate(this.gameState.Update);

  }
  /*
   * load the meshes from the file and assign the rôles
   */


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
