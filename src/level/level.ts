import { Scene, Camera, Vector3, KeyboardEventTypes, Mesh, Sprite } from 'babylonjs';
import Helpers from '../helpers/helpers'
import Core from '../core'
import { ISpriteInfo, SpriteLibrary } from '../services/index';
import * as States from '../states/index';
import { Light } from 'babylonjs/Lights/light';
import ICreateLevelClass from './ICreateLevelClass';
import { AdvancedDynamicTexture, Button, Control, Rectangle } from 'babylonjs-gui';
import Character from '../components/character';



export default abstract class Level implements ICreateLevelClass {
  //public
  public scene: Scene;
  public _camera: Camera = null;
  public _character: Character = null;
  public _lights: Light[] = [];
  public gameState: States.AbstractState;
  //protected
  public readonly env: Core;
  protected spriteLibrary: SpriteLibrary;
  protected spriteRefs: Sprite[] = [];
  constructor(env: Core) {
    this.env = env;

    this.gameState = new States.Default(this.env);
  }
  public abstract createLevel: () => Promise<Scene>;

  public InitLevel(): void {
    //DEBUG
    if (this.env.CONFIG.DEBUG) {
      this.scene.debugLayer.show();
      Helpers.showAxis(7, this.scene);
    }
    this.env.registerFunctionBeforeUpdate(this.gameState.Update);
    // GUI

    //TODO PUT UI in a separated space
    /*
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const button1 = Button.CreateSimpleButton("but1", "Click Me");
    button1.width = "150px"
    button1.height = "40px";
    button1.color = "white";
    button1.cornerRadius = 20;
    button1.background = "green";
    button1.onPointerUpObservable.add(function () {
      alert("you did it!");
    });
    advancedTexture.addControl(button1);
*/

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const mainContainer = new Rectangle();
    mainContainer.height = 0.05;
    mainContainer.width = 0.6;
    mainContainer.thickness = 0;
    mainContainer.background = "";
    mainContainer.top = "0px";
    mainContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    mainContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(mainContainer);

    const containerbg = new Rectangle();
    containerbg.thickness = 0;
    containerbg.background = "lime";
    //containerbg.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    mainContainer.addControl(containerbg);

    /*
        let alpha = 0;
        let beta = 0;
        this.scene.onBeforeRenderObservable.add(function(){
          image.top = beta;
          containerbg.top = alpha;
          image.isDirty = true;
          containerbg.isDirty = true;
          alpha += 1;
          beta -= 1;
          if(beta < -220){
               alpha = 0;
               beta = 0;
          }
          });*/
    this.scene.onBeforeRenderObservable.add(() => {
      containerbg.width = this.env.stamina / this.env.CONFIG.MAXSTAMINA;
      //TODO : should be ratio over max
    });
  }
  AddSpritesFromTag(tag: string): Mesh[] {
    const meshes = this.scene.getMeshesByTags(tag);
    const spriteInfo: ISpriteInfo = this.spriteLibrary[tag];
    for (const mesh of meshes) {
      const code = Math.random().toString(16);
      const instanceOfSprite = new Sprite("sprite-" + code, spriteInfo.manager);
      instanceOfSprite.playAnimation(spriteInfo.animationStart, spriteInfo.animationEnd, true, spriteInfo.animationDelay);
      instanceOfSprite.size = spriteInfo.size;
      instanceOfSprite.position = mesh.position;

      this.spriteRefs[instanceOfSprite.name] = instanceOfSprite;
      mesh.name = "item-" + code;
      mesh.isVisible = false;
    }
    return meshes;
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
