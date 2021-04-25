import { Vector3, Color3, Scene, MeshBuilder, LinesMesh } from 'babylonjs';

export default class Helpers {
  /**
   * Add XYZ gizmo axis into the scene
   * @param size the size of the axis
   * @param scene the scene were to import axis 
   */
  public static showAxis(size: number, scene: Scene): void {
    const axisX = MeshBuilder.CreateLines("axisX", {
      points: [Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
      new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)]
    }, scene);
    axisX.color = new Color3(1, 0, 0);
    const axisY = MeshBuilder.CreateLines("axisY", {
      points: [
        Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
      ]
    }, scene);
    axisY.color = new Color3(0, 1, 0);
    const axisZ = MeshBuilder.CreateLines("axisZ", {
      points: [Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
      new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)]
    }, scene);
    axisZ.color = new Color3(0, 0, 1);
  }

  /**
   * Draw gizmo of a vector into the scene
   * @param vector the vector to draw
   * @param size the size of the vector
   * @param scene the scene were to import axis 
   */
  public static DrawVector(scene: Scene, vector: Vector3, size = 1, origin = Vector3.Zero(), color = new Color3(1, 1, 1)): LinesMesh {
    const xValue = vector.x * size;
    const yValue = vector.y * size;
    const zValue = vector.z * size;
    const result = MeshBuilder.CreateLines("resultVector", {
      points: [origin, new Vector3(xValue, yValue, zValue)]
    }, scene);
    result.color = color;
    return result;
  }
}
