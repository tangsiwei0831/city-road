class ColorLayer {
    constructor(name, color, callback) {
      this.name = name;
      this.changeColor = callback;
      this.color = color;
    }
}

export default ColorLayer;