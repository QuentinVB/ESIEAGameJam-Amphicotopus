import { ArcRotateCamera, CannonJSPlugin, HemisphericLight, Scene, SceneLoader, Vector3, PhysicsImpostor, KeyboardEventTypes } from "babylonjs";
import Level from "./level";

export default class FromFileLevel extends Level {

  public createLevel = async (): Promise<Scene> => {
    const imported = await SceneLoader.LoadAsync(this.env.CONFIG.meshUrl, this.env.levelName + ".babylon", this.env.engine)
      .then((scene) => {
        this.scene = scene;
      });

    //DEBUG CAMERA
    const camera = new ArcRotateCamera("DebugCamera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.env.canvas, true);
    camera.useFramingBehavior = true;
    //this.scene.activeCamera = camera;
    this._camera = camera;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    this.scene.enablePhysics(new Vector3(0, this.env.CONFIG.GRAVITY, 0), new CannonJSPlugin());

    //bind character
    const character = this.scene.getMeshByName("Character");
    character.physicsImpostor = new PhysicsImpostor(character, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, this.scene);

    //bind controls
    this.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYDOWN) {
        switch (kbInfo.event.keyCode) {
          //spaceBar
          case 32:
            console.log("pressed spacebar");
            character.physicsImpostor.applyImpulse(new Vector3(0, 0, 20), character.getAbsolutePosition());
            break;
        }
      }
    });


    //replace camera by follow camera and copy information

    //bind ground
    const ground = this.scene.getMeshByName("Ground");
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);


    return this.scene;
  };
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