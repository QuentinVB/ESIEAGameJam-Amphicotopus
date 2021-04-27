import { Sound, Scene, Engine } from "babylonjs";

export class SoundLibrary {
  private _scene: Scene;
  private _soundsUrl: string;
  public underwaterAmbient: Sound;
  public aquariumMusic: Sound;
  public crounch: Sound;
  public bonk: Sound;

  constructor(currentEngine: Engine, soundUrl: string) {
    this._scene = new Scene(currentEngine);
    this._soundsUrl = soundUrl;
  }
  public async loadSounds(): Promise<void> {
    console.log("start loading sound");
    this.underwaterAmbient = new Sound("underwaterambient", this._soundsUrl + "Ambiance-ocean.mp3", this._scene, null, {
      volume: 0.1,

    });
    this.aquariumMusic = new Sound("aquariumMusic", this._soundsUrl + "Saint-Saens_-_The_Carnival_of_the_Animals_-_07_Aquarium.ogg", this._scene, () => {
      this.aquariumMusic.play();
    }, {
      volume: 0.2,
      loop: true,
    });
    this.crounch = new Sound("crounch", this._soundsUrl + "crounch.mp3", this._scene, null, {
      volume: 0.2,
    });
    this.bonk = new Sound("bonk", this._soundsUrl + "Rock-collision-BONK.mp3", this._scene, null, {
      volume: 0.2,
    });
  }
}
