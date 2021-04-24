import { Engine, Scene } from 'babylonjs';
import { Level, DefaultLevel, FromFileLevel } from './level/index';
import ICreateLevelClass from './level/ICreateLevelClass'
/**
 * The main game container, it will handle high level logic and rendering of the game
 */
export default class Core {
  // private members
  public engine: Engine;
  /**
   * The actual level loaded in the Core
   */
  public level: Level;
  public levelName: string;
  public canvas: HTMLCanvasElement;
  public get scene(): Scene {
    return this.level.scene;
  }

  /**
   * game and physic constants
   */
  public readonly CONFIG = {
    camera: [3 * Math.PI / 2, 0, 10],
    player: [1.3, 2, -1.6],
    MAX_VELOCITY: 1.5,
    TERMINAL_VELOCITY: 20,
    JUMP_FORCE: 4,
    SPEED: 3,
    GRAVITY: -9.81,
    meshUrl: "./public/mesh/",
    DEBUG: true
  }

  // Constructor
  constructor(startlevelName?: string) {
    this.levelName = startlevelName;
  }
  /**
   * Runs the engine to render the level into the canvas
   */
  public run(): void {
    this.Init().then(() => {
      // scene started rendering, everything is initialized
    });
  }

  public async Init(): Promise<void> {
    //switch here (basic level)
    const createLevelModule = this.loadLevel();//"level0"

    //load pre task in the module
    await Promise.all(createLevelModule.preTasks || []);

    this.canvas = <HTMLCanvasElement>document.getElementById('renderCanvas');

    this.engine = new Engine(this.canvas);
    //engine options here !

    await createLevelModule.createLevel().then(() => {
      this.level.InitLevel();
      /*  
var options = new BABYLON.SceneOptimizerOptions();
   options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));

   // Optimizer
   var optimizer = new BABYLON.SceneOptimizer(this.scene, options);
   optimizer.start();*/
    });


    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  public loadLevel(): ICreateLevelClass {

    //if (this.level) this.level.scene.dispose();
    if (this.levelName) {
      this.level = new FromFileLevel(this);
    }
    else {
      this.level = new DefaultLevel(this);
    }



    return this.level;
  }
}