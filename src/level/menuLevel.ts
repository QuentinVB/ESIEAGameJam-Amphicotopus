import { FreeCamera, PostProcess, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Rectangle, Image, TextBlock, Control, Button } from "babylonjs-gui";
import Level from "./level";

export default class MenuLevel extends Level {

  public createLevel = async (): Promise<Scene> => {
    this.env.engine.displayLoadingUI();

    const scene = new Scene(this.env.engine);
    this.scene = scene;
    this.scene.clearColor = this.env.CONFIG.BG_COLOR;

    //setup a rotating camera around the center of the scene
    const camera = new FreeCamera("DebugCamera", Vector3.Backward(), this.scene);
    camera.setTarget(Vector3.Zero());
    //camera.attachControl(this.env.canvas, true);
    this._camera = camera;

    //--GUI--
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    guiMenu.idealHeight = 720;

    //background image
    const imageRect = new Rectangle("titleContainer");
    imageRect.width = 0.8;
    imageRect.thickness = 0;
    guiMenu.addControl(imageRect);

    const startbg = new Image("startbg", "./public/img/start.jpeg");
    startbg.stretch = Image.STRETCH_UNIFORM;
    startbg.sourceTop =
      startbg.verticalAlignment = Image.VERTICAL_ALIGNMENT_BOTTOM;
    imageRect.addControl(startbg);

    const title = new TextBlock("title", "UN TITRE");
    title.resizeToFit = true;
    title.fontFamily = "Arial";
    title.fontSize = "32px";
    title.color = "white";
    title.resizeToFit = true;
    title.top = "54px";
    title.width = 0.8;
    title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    imageRect.addControl(title);

    const startBtn = Button.CreateSimpleButton("start", "PLAY");
    startBtn.fontFamily = "Viga";
    startBtn.width = 0.2
    startBtn.height = "40px";
    startBtn.color = "white";
    startBtn.thickness = 0;
    startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    imageRect.addControl(startBtn);

    startBtn.onPointerDownObservable.add(() => {
      //fade screen
      //TODO : should be in another method ?
      const postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, camera);
      postProcess.onApply = (effect) => {
        effect.setFloat("fadeLevel", this.fadeLevel);
      };
      this._transition = true;
      //sounds
      //sfx.play();

      //scene.detachControl(); //observables disabled

      console.log("launch the cutscene !");
    });
    this.registredTransiton = () => {

      console.log("fade done");
      this.env.setScenarioStep(1);
    }

    //--SCENE FINISHED LOADING--
    //await scene.whenReadyAsync();
    this.env.engine.hideLoadingUI(); //when the scene is ready, hide loading
    //lastly set the current state to the start state and set the scene to the start scene
    //this._scene.dispose();
    //this._scene = scene;
    //this._state = State.START;
    return scene;
  };


  /*
    public preTasks? = (): Promise<unknown>[] => {
      return undefined;
    };
    */
}
