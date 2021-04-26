import { Engine, Scene, Vector3, Color4, Color3 } from 'babylonjs';
import { Level, DefaultLevel, FromFileLevel, MenuLevel, CutsceneLevel } from './level/index';

import ICreateLevelClass from './level/ICreateLevelClass'
import { SoundLibrary } from './services/soundLib';
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
  public soundLibrary: SoundLibrary;
  //score
  public stamina: number;

  private registredFunction = [];

  private readonly MAX_VELOCITY = 1.5;
  /**
   * game and physic constants
   */
  public readonly CONFIG = {
    camera: [3 * Math.PI / 2, 0, 10],
    player: [1.3, 2, -1.6],
    MIN_VELOCITY_VECTOR: new Vector3(-this.MAX_VELOCITY, -this.MAX_VELOCITY, -this.MAX_VELOCITY),
    MAX_VELOCITY_VECTOR: new Vector3(this.MAX_VELOCITY, this.MAX_VELOCITY, this.MAX_VELOCITY),
    TERMINAL_VELOCITY: 20,
    JUMP_FORCE: 4,
    SPEED: 3,
    GRAVITY: 0,//-9.81
    BG_COLOR: new Color4(52 / 255, 99 / 255, 185 / 255, 1),
    FOG_COLOR: new Color3(65 / 255, 188 / 255, 238 / 255),
    FOG_START: 5,
    FOG_END: 30,
    meshUrl: "./public/mesh/",
    soundUrl: "./public/sounds/",
    MEDUSASTAMINAVALUE: 10,
    BAGSTAMINACOST: 20,
    BASESTAMINA: 50,
    MAXSTAMINA: 100,
    //add other ?
    DEBUG: true
  }

  private readonly SCENARIO = [
    "menu",
    "opening",
    "level0",
    "victory"
  ];
  private _scenarioStep: number;
  private _byPassScenario = false;
  private loading: boolean;
  // Constructor
  constructor(startlevelName?: string) {
    if (startlevelName) {
      this._byPassScenario = true;
      this.levelName = startlevelName;
    }
    else {
      this._scenarioStep = 0;
    }

    this.registredFunction = [];
    this.stamina = this.CONFIG.BASESTAMINA;

  }
  /**
   * Runs the engine to render the level into the canvas
   */
  public run(): void {
    this.loading = true;
    const createLevelModule = this.loadLevel();
    this.Init(createLevelModule).then(() => {
      this.loading = false;
      // scene started rendering, everything is initialized
    });
  }

  public async Init(createLevelModule: ICreateLevelClass): Promise<void> {
    //load pre task in the module
    await Promise.all(createLevelModule.preTasks || []);
    this.canvas = <HTMLCanvasElement>document.getElementById('renderCanvas');
    this.engine = new Engine(this.canvas, true);
    //engine options here !

    await createLevelModule.createLevel().then(() => {
      //TODO :music should be loaded from another scene
      this.soundLibrary = new SoundLibrary(this.level.scene, this.CONFIG.soundUrl);
      this.soundLibrary.loadSounds();

      this.level.InitLevel();

      this.soundLibrary.aquariumMusic.play();
      /*  
var options = new BABYLON.SceneOptimizerOptions();
   options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));

   // Optimizer
   var optimizer = new BABYLON.SceneOptimizer(this.scene, options);
   optimizer.start();*/
    });
    const registred = this.registredFunction;
    this.scene.registerBeforeRender(() => {
      for (const callback of registred) {
        callback();
      }
    });
    this.engine.runRenderLoop(() => {
      if (!this.loading) this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  public loadLevel(): ICreateLevelClass {
    if (this.level) this.level.scene.dispose();

    if (this._byPassScenario) {
      if (this.levelName == "scene_start_menu") {
        this.level = new MenuLevel(this);
      }
      else if (this.levelName) {
        this.level = new FromFileLevel(this);
      }
      else {
        this.level = new DefaultLevel(this);
      }
    }
    else {
      const scenario = this.SCENARIO[this._scenarioStep];
      console.log(`load scenario, scene number ${this._scenarioStep} : "${scenario}"`);
      if (scenario === "menu") this.level = new MenuLevel(this);
      if (scenario === "opening") this.level = new CutsceneLevel(this, "opening");
      if (scenario === "victory") this.level = new CutsceneLevel(this, "victory");
      if (scenario.startsWith("level")) {
        this.levelName = "scene_" + scenario;
        this.level = new FromFileLevel(this);
      }
    }

    return this.level;
  }
  public ChangeLevel(levelName?: string): void {
    this.levelName = levelName;
    this.run();
  }
  public setScenarioStep(step: number): void {
    //TODO : add guards !
    this._scenarioStep = step;
    this.run();
  }
  public getScenarioStep(): number {
    return this._scenarioStep;
  }
  //TODO callback could request time ?
  public registerFunctionBeforeUpdate(callback: () => void): void {
    this.registredFunction.push(callback);
  }
  //goto()per state
}