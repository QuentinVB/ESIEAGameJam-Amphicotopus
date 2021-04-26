import { Sound, Scene } from "babylonjs";

export class SoundLibrary {
  private _scene: Scene;
  private _soundsUrl: string;
  public underwaterAmbient: Sound;
  public aquariumMusic: Sound;

  constructor(currentScene: Scene, soundUrl: string) {
    this._scene = currentScene;
    this._soundsUrl = soundUrl;
  }
  public loadSounds(): void {
    this.underwaterAmbient = new Sound("underwaterambient", this._soundsUrl + "Ambiance-ocean.mp3", this._scene, null, {
      volume: 0.3,
    });
    this.aquariumMusic = new Sound("aquariumMusic", this._soundsUrl + "Saint-Saens_-_The_Carnival_of_the_Animals_-_07_Aquarium.ogg", this._scene, null, {
      volume: 0.4,
    });
    /*
        this._explosionSfx = new Sound("selection", "./sounds/fw_03.wav", this._scene, function () {
        }, {
          volume: 0.5,
        });*/
  }
}
