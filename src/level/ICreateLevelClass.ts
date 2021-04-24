import { Scene } from "babylonjs";

//TODO : Should be in a different file
export default interface ICreateLevelClass {
  createLevel: () => Promise<Scene>;
  preTasks?: Promise<unknown>[];
}



