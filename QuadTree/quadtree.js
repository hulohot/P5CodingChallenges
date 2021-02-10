class Point {
    constructor(x, y, userData) {
      this.x = x;
      this.y = y;
      this.userData = userData;
    }
  }
  
  class Rectangle {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  
    contains(point) {
      return (
        point.x >= this.x - this.w &&
        point.x < this.x + this.w &&
        point.y >= this.y - this.h &&
        point.y < this.y + this.h
      );
    }
  
    intersects(range) {
      return !(range.x - range.w > this.x + this.w ||
        range.x + range.w < this.x - this.w ||
        range.y - range.h > this.y + this.h ||
        range.y + range.h < this.y - this.h
      )
    }
  }
  
  // circle class for a circle shaped query
  class Circle {
    constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.rSquared = this.r * this.r;
    }
  
    contains(point) {
      // check if the point is in the circle by checking if the euclidean distance of
      // the point and the center of the circle if smaller or equal to the radius of
      // the circle
      let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
      return d <= this.rSquared;
    }
  
    intersects(range) {
      var xDist = Math.abs(range.x - this.x);
      var yDist = Math.abs(range.y - this.y);
  
      // radius of the circle
      var r = this.r;
  
      var w = range.w;
      var h = range.h;
  
      var edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);
  
      // no intersection
      if (xDist > r + w || yDist > r + h) return false;
  
      // intersection within the circle
      if (xDist <= w || yDist <= h) return true;
  
      // intersection on the edge of the circle
      return edges <= this.rSquared;
    }
  }
  
  class QuadTree {
    constructor(boundary, capacity) {
      if (!boundary) {
        throw TypeError('boundary is null or undefined');
      }
      if (!(boundary instanceof Rectangle)) {
        throw TypeError('boundary should be a Rectangle');
      }
      if (typeof capacity !== 'number') {
        throw TypeError(
          `capacity should be a number but is a ${typeof capacity}`
        );
      }
      if (capacity < 1) {
        throw RangeError('capacity must be greater than 0');
      }
      this.boundary = boundary;
      this.capacity = capacity;
      this.points = [];
      this.divided = false;
    }
  
    subdivide() {
      let x = this.boundary.x;
      let y = this.boundary.y;
      let w = this.boundary.w;
      let h = this.boundary.h;
  
      let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
      let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
      let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
      let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
      this.northwest = new QuadTree(nw, this.capacity);
      this.northeast = new QuadTree(ne, this.capacity);
      this.southwest = new QuadTree(sw, this.capacity);
      this.southeast = new QuadTree(se, this.capacity);
      this.divided = true;
    }
  
    insert(point) {
      if (!this.boundary.contains(point)) {
        return false;
      }
  
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      } else {
        if (!this.divided) {
          this.subdivide();
        }
        if (this.northeast.insert(point)) return true;
        if (this.northwest.insert(point)) return true;
        if (this.southeast.insert(point)) return true;
        if (this.southwest.insert(point)) return true;
      }
    }
  
    query(range, found) {
  
      if (!found) {
        found = [];
      }
  
      if (!this.boundary.intersects(range)) {
        return found;
      } else {
        for (let p of this.points) {
          if (range.contains(p)) {
            found.push(p)
          }
        }
        if (this.divided) {
          this.northwest.query(range, found);
          this.northeast.query(range, found);
          this.southwest.query(range, found);
          this.southeast.query(range, found);
        }
        return found;
      }
    }
  
    show() {
      stroke(255);
      noFill();
      strokeWeight(1);
      rectMode(CENTER);
      rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
      if (this.divided) {
        this.northeast.show();
        this.northwest.show();
        this.southeast.show();
        this.southwest.show();
      }
  
      for (let p of this.points) {
        strokeWeight(4);
        point(p.x, p.y)
      }
    }
  }