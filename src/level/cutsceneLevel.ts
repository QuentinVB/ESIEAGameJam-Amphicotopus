import { FreeCamera, PostProcess, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Rectangle, Image, TextBlock, Control, Button } from "babylonjs-gui";
import Core from "../core";
import Level from "./level";

export default class CutsceneLevel extends Level {

  private _cutsceneName: string;
  /**
   *
   */
  constructor(env: Core, cutsceneName: string) {
    super(env);
    this._cutsceneName = cutsceneName;
  }

  public createLevel = async (): Promise<Scene> => {
    this.env.engine.displayLoadingUI();

    const scene = new Scene(this.env.engine);
    this.scene = scene;
    this.scene.clearColor = this.env.CONFIG.BG_COLOR;

    //setup a rotating camera around the center of the scene
    const camera = new FreeCamera("ViewCamera", Vector3.Backward(), this.scene);
    camera.setTarget(Vector3.Zero());
    //camera.attachControl(this.env.canvas, true);
    this._camera = camera;

    const postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._camera);
    postProcess.onApply = (effect) => {
      effect.setFloat("fadeLevel", this.fadeLevel);
    };

    switch (this._cutsceneName) {
      case "opening": this._openingCutscene(); break;
      case "victory": this._victoryCutscene(); break;
      default: throw "WTF is this scene ?";
    }

    this.env.engine.hideLoadingUI(); //when the scene is ready, hide loading

    return scene;
  };
  private _openingCutscene(): void {
    //--GUI--
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    guiMenu.idealHeight = 720;

    //background image
    const imageRect = new Rectangle("banddessinée");
    imageRect.width = 0.8;
    imageRect.thickness = 0;
    guiMenu.addControl(imageRect);

    const startbg = new Image("startbg", "./public/img/start.jpeg");
    startbg.stretch = Image.STRETCH_UNIFORM;
    startbg.sourceTop =
      startbg.verticalAlignment = Image.VERTICAL_ALIGNMENT_BOTTOM;
    imageRect.addControl(startbg);

    //TODO : make it better
    const startBtn = Button.CreateSimpleButton("Skip", "PLAY");
    startBtn.fontFamily = "Viga";
    startBtn.width = 0.2
    startBtn.height = "40px";
    startBtn.color = "white";
    startBtn.thickness = 0;
    startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    startBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    imageRect.addControl(startBtn);

    startBtn.onPointerDownObservable.add(() => {
      //fade screen
      this._transition = true;
      console.log("launch the game !")
    });
    this.registredTransiton = () => {
      console.log("fade done");
      this.env.setScenarioStep(2);
    }

  }
  private _victoryCutscene(): void {
    //--GUI--
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    guiMenu.idealHeight = 720;

    //background image
    const imageRect = new Rectangle("banddessinée_victoire");
    imageRect.width = 0.8;
    imageRect.thickness = 0;
    guiMenu.addControl(imageRect);

    const startbg = new Image("startbg", "./public/img/start.jpeg");
    startbg.stretch = Image.STRETCH_UNIFORM;
    startbg.sourceTop =
      startbg.verticalAlignment = Image.VERTICAL_ALIGNMENT_BOTTOM;
    imageRect.addControl(startbg);
  }
}
