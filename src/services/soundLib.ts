import { Sound, Scene } from "babylonjs";



export class SoundLibrary {
  private _scene: Scene;
  private _soundsUrl: string;
  public underwaterAmbient: Sound;

  constructor(currentScene: Scene, soundUrl: string) {
    this._scene = currentScene;
    this._soundsUrl = soundUrl;
  }
  public loadSounds(): void {
    this.underwaterAmbient = new Sound("underwaterambient", this._soundsUrl + "Ambiance-ocean.mp3", this._scene, null, {
      volume: 0.5,
    });
    /*
        this._explosionSfx = new Sound("selection", "./sounds/fw_03.wav", this._scene, function () {
        }, {
          volume: 0.5,
        });*/
  }
}
