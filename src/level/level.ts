import { Scene, Camera, Vector3, KeyboardEventTypes, Mesh, Sprite, Effect } from 'babylonjs';
import Helpers from '../helpers/helpers'
import Core from '../core'
import { ISpriteInfo, SpriteLibrary } from '../services/index';
import { AbstractState, Default } from '../states/index';
import { Light } from 'babylonjs/Lights/light';
import ICreateLevelClass from './ICreateLevelClass';
import Character from '../components/character';



export default abstract class Level implements ICreateLevelClass {
  //public
  public scene: Scene;
  public _camera: Camera = null;
  public _character: Character = null;
  public _lights: Light[] = [];
  public gameState: AbstractState;
  public _transition = false;
  public registredTransiton: () => void;
  public fadeLevel = 0;
  public readonly env: Core;

  //protected
  protected spriteLibrary: SpriteLibrary;
  protected spriteRefs: Sprite[] = [];

  constructor(env: Core) {
    this.env = env;

    this.gameState = new Default(this.env);
    Effect.RegisterShader("fade",
      "precision highp float;" +
      "varying vec2 vUV;" +
      "uniform sampler2D textureSampler; " +
      "uniform float fadeLevel; " +
      "void main(void){" +
      "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
      "baseColor.a = 1.0;" +
      "gl_FragColor = baseColor;" +
      "}");
  }
  public abstract createLevel: () => Promise<Scene>;

  public InitLevel(): void {
    //DEBUG
    if (this.env.CONFIG.DEBUG) {
      this.scene.debugLayer.show();
      Helpers.showAxis(7, this.scene);
    }
    this.env.registerFunctionBeforeUpdate(() => { this.gameState.Update() });

    this.fadeLevel = 1.0;
    this._transition = false;
    this.env.registerFunctionBeforeUpdate(() => {
      if (this._transition && this.registredTransiton != undefined) {
        this.fadeLevel -= .05;
        if (this.fadeLevel <= 0) {
          this.registredTransiton();
          this._transition = false;
        }
      }
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
    //actions from mouse
    this.scene.onPointerDown = (evt, pickResult) => {
      // if the click hits the ground object, we change the impact position
      if (pickResult.hit) {
        console.log(" x = " + pickResult.pickedPoint.x + " y = " + pickResult.pickedPoint.z);
      }
    }
  }
}
